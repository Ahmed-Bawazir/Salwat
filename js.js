//ServiceWorker
const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "service-worker.js"
      );
      if (registration.installing) {
        console.log("Service worker installing");
      } else if (registration.waiting) {
        console.log("Service worker installed");
      } else if (registration.active) {
        console.log("Service worker active");
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};
registerServiceWorker();

//update data
function getData() {
  let api = new XMLHttpRequest();
  api.open("GET", "data.json");
  api.send();
  api.onload = function () {
    if (this.readyState == 4 && this.status == 200) {
      localStorage.setItem("myData1", this.responseText);
      console.log("asdf");
      location.reload();
    }
  };
}
//
//

let prayerTimes = [];
let masjed = localStorage.getItem("msjd") || "ALSDDEQ";
document
  .querySelector(`select option[value=${masjed}]`)
  .setAttribute("selected", true);

let data = localStorage.getItem("myData1");

let mydata;
if (data) {
  // console.log("local storage");
  mydata = JSON.parse(data);
  prayerTimes = mydata.Adan.map((e, i) => {
    return { ...e, ...mydata[masjed].time[i] };
  });
  //
  //
  updateCountdown();
  setInterval(updateCountdown, 60 * 1000);
} else {
  fetch("data.json")
    .then((e) => e.json())
    .then((e) => {
      // console.log(e);
      localStorage.setItem("myData1", JSON.stringify(e));
      mydata = e;
      prayerTimes = mydata.Adan.map((ele, i) => {
        return { ...ele, ...mydata[masjed].time[i] };
      });
      //  console.log("from network");
      updateCountdown();
      setInterval(updateCountdown, 60 * 1000);
    });
}
document.querySelector("select").addEventListener("change", (e) => {
  masjed = e.target.value;
  localStorage.setItem("msjd", e.target.value);

  prayerTimes = mydata.Adan.map((e, i) => {
    return { ...e, ...mydata[masjed].time[i] };
  });
  updateCountdown();
  setInterval(updateCountdown, 60 * 1000);
});
/////////
function convertTo12HourFormat(time24) {
  const [hour24, minute] = time24.split(":").map(Number);
  const period = hour24 >= 12 ? "م" : "ص";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
}

function getTimeRemaining(targetTime) {
  const now = new Date();
  const [hour, minute] = targetTime.split(":").map(Number);
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (target < now) {
    target.setDate(target.getDate() + 1);
  }
  const diffMs = target - now;
  const diffMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return { hours, minutes, totalMinutes: diffMinutes };
}

function findNextEvent() {
  const now = new Date();
  let closest = null;
  let closestDiff = Infinity;
  let type = ""; // "أذان" أو "إقامة"

  for (const prayer of prayerTimes) {
    const azanDiff = getTimeRemaining(prayer.adan).totalMinutes;
    if (azanDiff >= 0 && azanDiff < closestDiff) {
      closest = { name: prayer.name, time: prayer.adan };
      closestDiff = azanDiff;
      type = "أذان";
    }

    const iqamaDiff = getTimeRemaining(prayer.iqama).totalMinutes;
    if (iqamaDiff >= 0 && iqamaDiff < closestDiff) {
      closest = { name: prayer.name, time: prayer.iqama };
      closestDiff = iqamaDiff;
      type = "إقامة";
    }
  }

  const timeLeft = getTimeRemaining(closest.time);
  return {
    eventType: type,
    prayerName: closest.name,
    time: convertTo12HourFormat(closest.time),
    timeLeft,
  };
}

function updateCountdown() {
  //table
  let text = "";
  for (let index = 0; index < prayerTimes.length; index++) {
    text += `
   <tr>
   <th>${prayerTimes[index].name}</th>
   <td>${convertTo12HourFormat(prayerTimes[index].adan)}</td>
   <td>${convertTo12HourFormat(prayerTimes[index].iqama)}</td>
   </tr>`;
  }

  document.getElementById("table-data").innerHTML = text;
  let lastupDate = document.querySelector(".update span");
  if (mydata[masjed].lastUpdate.includes("!")) {
    lastupDate.innerHTML = `<span style="color:red;font-weight:bold">انتبه !! التوقيت لهذا المسجد قديم جدا </span>`;
    document.getElementById("footer").innerText =
      "اوقات هذا المسجد ليست محدثة  !!";
  } else {
    lastupDate.innerHTML = `اخر تحديث ${
      mydata[masjed].lastUpdate
    }  ${daysAgoText(mydata[masjed].lastUpdate)}`;
    const next = findNextEvent();
    let h = next.timeLeft.hours > 0 ? ` ${next.timeLeft.hours} ساعة و` : "";
    const time = ` ${h} ${next.timeLeft.minutes + 1} دقيقة `;
    document.getElementById(
      "footer"
    ).innerText = `تبقى ${time}من ${next.eventType} ${next.prayerName}`;
  }
  //next

  //Notification
  // if (Notification.permission !== "granted") {
  //   Notification.requestPermission();
  // }
  // if (
  //   Notification.permission === "granted" &&
  //   next.timeLeft.totalMinutes < 21
  // ) {
  //   new Notification("الحدث اقترب!", {
  //     body: `تبقى اقل من 5دقائق على${next.eventType} ${next.prayerName}`,
  //     icon: "🔔",
  //   });
  // }
}
function daysAgoText(dateString) {
  const inputDate = new Date(dateString);
  const today = new Date();

  // ضبط الوقت لبداية اليوم
  inputDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today - inputDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0 || Number.isNaN(diffDays)) {
    return ""; // التاريخ في المستقبل
  } else if (diffDays === 0) {
    return "( اليوم )";
  } else if (diffDays === 1) {
    return "( أمس)";
  } else if (diffDays === 2) {
    return "( قبل يومين )";
  } else if (diffDays > 2 && diffDays < 7) {
    return `( قبل ${diffDays}أيام )`;
  } else if (diffDays > 6 && diffDays < 11) {
    return `<span style="color:darkred;font-weight:bold"> انتبه لم يتم تحديث الاوقات لاكثر من ${diffDays} ايام </span>`;
  } else {
    return `<span style="color:darkred;font-weight:bold"> انتبه لم يتم تحديث الاوقات لاكثر من ${diffDays} يوم </span>`;
  }
}
//
