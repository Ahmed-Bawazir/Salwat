//installing and add files to cache
let nameOfCache = "v1";
let assets = [
  "/",
  "index.html",
  "style.css",
  "js.js",
  "manifest.json",
  "date.json",
  "icon192.png",
];
let assets2 = [
  "/",
  "index.html",
  "style.css",
  "js.js",
  "manifest.json",
  "date.json",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(nameOfCache).then(function (cache) {
      for (let asset of assets) {
        try {
          cache.add(asset);
          //console.log(`add ${asset} to cache done`);
        } catch (err) {
          //console.log(`There error to add ${asset} to cache :${err}`);
        }
      }
    })
  );
});
//
self.addEventListener("fetch", (event) => {
  if (!event.request.url.includes("icon")) {
    event.respondWith(
      networkFirst2({
        request: event.request,
        fallbackUrl: "/icon192.png",
      })
    );
  }
});
const networkFirst2 = async ({ request, fallbackUrl }) => {
 
  try {
    const responseFromNetwork = await fetch(request);
    if (responseFromNetwork.ok) {
      //await putInCache(request, responseFromNetwork.clone());
      //
      caches.open(nameOfCache).then(function (cache) {
        for (let asset of assets2) {
          try {
            cache.add(asset);
            //console.log(`add ${asset} to cache done`);
          } catch (err) {
            //console.log(`There error to add ${asset} to cache :${err}`);
          }
        }
      });
      //
      //console.log("from network");

      return responseFromNetwork;
    }
  } catch (error) {
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
      return responseFromCache;
    } else {
      const fallbackResponse = await caches.match(fallbackUrl);
      return fallbackResponse;
    }
  }
};
