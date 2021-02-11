let db;
// CREATE budget DB
const request = indexedDB.open("budget", 1);

// CREATE object store and set to autoIncrement
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

// CHECK to see if application is online before reading DB
request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.log("Woops! " + event.target.errorCode);
};

// CREATE transaction on "pending" db store with readwrite access.
function saveRecord(record) {
  const transaction = db.transaction(["pending"], "readwrite");
  // ACCESS object store
  const store = transaction.objectStore("pending");
  // ADD record to "pending" store with add method.
  store.add(record);
}

// OPEN a transaction from object store "pending"
function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  // GET-ALL records from store and set to a variable
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
          //SUCCESS, open a transaction on your pending db
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");

          // CLEAR all items in your store
          store.clear();
        });
    }
  };
}

// LISTEN for "online"
window.addEventListener("online", checkDatabase);
