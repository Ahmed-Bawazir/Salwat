let pro;
if (navigator.onLine) {
    console.log("on");
pro = new Promise((resolve, reject) => {
    let api = new XMLHttpRequest();
    api.open("GET", "date.json");
    api.send();
    api.onload = function () {
      if (this.readyState == 4 && this.status == 200) {
        resolve(JSON.parse(this.responseText));
        localStorage.setItem("item", this.responseText);
      } else {
        reject("ERROR : somethig wrong");
      }
    };
  });
} else {
    console.log("no");
   pro = new Promise((resolve) => {
    let data = JSON.parse(localStorage.getItem("item"));
    resolve(data);
  });
}

pro.then((e) => {
  /* let date = new Map(Object.entries(e)); //convert object to map */
  //const
  let jsonData = e.pray;
  let textfooter = "";
  let title = [
    "أذان صلاة الفجر",
    "اقامة صلاة الفجر",
    "أذان صلاة الظهر",
    "اقامة صلاة الظهر",
    "أذان صلاة العصر",
    "اقامة صلاة العصر",
    "أذان صلاة المغرب",
    "اقامة صلاة المغرب",
    "أذان صلاة العشاء",
    "اقامة صلاة العشاء",
  ];
  let date = [];
  for (let index = 0; index < jsonData.length; index++) {
    date.push(jsonData[index].a);
    date.push(jsonData[index].b);
  }
  //
  //culc
  //Time Now
  let timeNow = new Date();
  let timeHourNow = timeNow.getHours();
  let timeMinuteNow = timeNow.getMinutes();
  let tnfh = timeHourNow > 9 ? `${timeHourNow}` : `0${timeHourNow}`;
  let tnfm = timeMinuteNow > 9 ? `${timeMinuteNow}` : `0${timeMinuteNow}`;
  let tnf = `${tnfh}:${tnfm}`;
  //
  for (let index = 0; index < date.length; index++) {
    if (tnf < date[index]) {
      let d =
        new Date(`1970-01-01T${date[index]}:00Z`) -
        new Date(`1970-01-01T${tnf}:00Z`);
      let diffrent = d / (1000 * 60);
      let h = Math.trunc(diffrent / 60);
      let m = Math.trunc(diffrent % 60);
      let mm =
        m == 1
          ? `دقيقة `
          : m == 2
          ? `دقيقتين `
          : m < 11
          ? `${m} دقائق `
          : `${m} دقيقة `;
      let hh =
        h == 1
          ? `ساعة `
          : h == 1
          ? `ساعتين `
          : h < 11
          ? `${h} ساعات `
          : `${h} ساعة `;
      textfooter =
        h == 0
          ? `بقي   ${mm}  من ${title[index]}`
          : `بقي   ${hh}  و ${mm} من ${title[index]}`;
      break;
    } else if (index === 9) {
      let d =
        new Date(`1970-01-02T${date[0]}:00Z`) -
        new Date(`1970-01-01T${tnf}:00Z`);
      let diffrent = d / (1000 * 60);
      let h = Math.trunc(diffrent / 60);
      let m = Math.trunc(diffrent % 60);
      let mm =
        m == 1
          ? `دقيقة `
          : m == 2
          ? `دقيقتين `
          : m < 11
          ? `${m} دقائق `
          : `${m} دقيقة `;
      let hh =
        h == 1
          ? `ساعة `
          : h == 1
          ? `ساعتين `
          : h < 11
          ? `${h} ساعات `
          : `${h} ساعة `;
      textfooter =
        h == 0
          ? `بقي   ${mm}  من ${title[index]}`
          : `بقي   ${hh}  و ${mm} من ${title[0]}`;
      break;
    }
  }
  //
  //
  let text = "";
  for (let index = 0; index < jsonData.length; index++) {
    text += `
    <tr>
       <th>${jsonData[index].name}</th>
       <td>${
         jsonData[index].a.split(":")[0] > 12
           ? `${jsonData[index].a.split(":")[0] - 12}:${
               jsonData[index].a.split(":")[1]
             }`
           : `${jsonData[index].a}`
       }</td>
       <td>${
         jsonData[index].b.split(":")[0] > 12
           ? `${jsonData[index].b.split(":")[0] - 12}:${
               jsonData[index].b.split(":")[1]
             }`
           : `${jsonData[index].b}`
       }</td>
     </tr>`;
  }
  //
  let content = document.createElement("div");
  content.className = "container";
  content.innerHTML = `
    <div class="container">
      <h2>مواقيت الصلوات(test) | مسجد الرحمة
        <br/>
        <span>بمنطقة النقعة</span></h2>
     
 <table>
   <thead>
     <tr>
       <th class="nn">الفرض / وقت ..</th>
       <th class="nn">الأذان</th>
       <th class="nn">الإقامة</th>
     </tr>
   </thead>
   <tbody>
   ${text}
   </tbody>
 </table>
 <br/>
   <span class="update">أخر تحديث ${e.update}  </span>
 <div class="footer">
   ${textfooter}
   
 </div>
<div class="contact">  للتواصل  ||<a href="https://wa.me/967775998812">4HM3D<a/></div>
</div>
`;
  document.body.appendChild(content);
});
