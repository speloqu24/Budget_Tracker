let db;
// create a new db request for a "budget" database.
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  // create object store
  const db = event.target.result;
  // set autoIncrement to true
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;

  // check if app is online before reading from budget db
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.log("Woops! " + event.target.errorCode);
};

function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  const transaction = db.transaction(["pending"], "readwrite");

  // access object store
  const store = transaction.objectStore("pending");

  // add record to "pending" store with add method.
  store.add(record);
}

function checkDatabase() {
  // open a transaction on pending db
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  // get all records from store and set to a variable
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          // if successful, open a transaction on your pending db
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");

          // clear all items in your store
          store.clear();
        });
    }
  };
}

// listen for "online"
window.addEventListener("online", checkDatabase);
