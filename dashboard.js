
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
  import { getAuth, onAuthStateChanged, deleteUser, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
  import {
    getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc
  } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyD-dEMWkAblqRDVd5-7tp6EJ0PcwfMwmAc",
    authDomain: "card-app-48b0e.firebaseapp.com",
    projectId: "card-app-48b0e",
    storageBucket: "card-app-48b0e.appspot.com",
    messagingSenderId: "334506878461",
    appId: "1:334506878461:web:75a75cd206f0f47302a594"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const addItemBtn = document.getElementById("addItemBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const addItemForm = document.getElementById("addItemForm");
  const itemsContainer = document.getElementById("itemsContainer");
  const modalRef = new bootstrap.Modal(document.getElementById("addItemModal"));

  onAuthStateChanged(auth, async user => {
    if (!user) return window.location.href = "index.html";
    loadItems(user.uid);
  });

  logoutBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete your account and all your items!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (!confirm.isConfirmed) return;

    try {
      const itemsRef = collection(db, `items-${user.uid}`);
      const snapshot = await getDocs(itemsRef);

      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, `items-${user.uid}`, docSnap.id));
      }

      await deleteUser(user);
      await signOut(auth);

      await Swal.fire({
        icon: "success",
        title: "Account deleted!",
        text: "Your account and all items have been deleted.",
        timer: 2000,
        showConfirmButton: false
      });

      window.location.href = "index.html";
    } catch (err) {
      console.error("Logout Error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message
      });
    }
  });

  addItemBtn.addEventListener("click", () => {
    addItemForm.reset();
    document.getElementById("editId").value = "";
    modalRef.show();
  });

  addItemForm.addEventListener("submit", async e => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const data = {
      name: document.getElementById("itemName").value,
      price: document.getElementById("itemPrice").value,
      image: document.getElementById("itemImage").value,
      desc: document.getElementById("itemDesc").value,
      createdAt: new Date()
    };
    const editId = document.getElementById("editId").value;

    try {
      if (editId) {
        await updateDoc(doc(db, `items-${user.uid}`, editId), data);
      } else {
        await addDoc(collection(db, `items-${user.uid}`), data);
      }

      modalRef.hide();

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Item saved successfully",
        showConfirmButton: false,
        timer: 1500
      });

      loadItems(user.uid);
    } catch (err) {
      console.error("Error saving item:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to save item",
        text: err.message
      });
    }
  });

  
  async function loadItems(uid) {
    itemsContainer.innerHTML = "";
    const snapshot = await getDocs(collection(db, `items-${uid}`));
    snapshot.forEach(d => {
      const item = d.data();
      const card = document.createElement("div");
      card.className = "col-md-4 mb-4";
      card.innerHTML += `
        <div class="card card-custom h-100">
          <img src="${item.image}" class="card-img-top" alt="${item.name}">
          <div class="card-body">
            <h5>${item.name}</h5>
            <p>${item.desc}</p>
            <p><strong>Price:</strong> ₹${item.price}</p>
            <button class="btn-edit">Edit</button>
            <button class="btn-delete">Delete</button>
          </div>
        </div>`;
      itemsContainer.appendChild(card);

      
      card.querySelector(".btn-delete").onclick = async () => {
        const confirm = await Swal.fire({
          title: "Delete this item?",
          text: "You can't undo this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel"
        });

        if (!confirm.isConfirmed) return;

        await deleteDoc(doc(db, `items-${uid}`, d.id));
        await Swal.fire({
          icon: "success",
          title: "Item deleted",
          timer: 1000,
          showConfirmButton: false
        });
        loadItems(uid);
      };

      
      card.querySelector(".btn-edit").onclick = () => {
        document.getElementById("editId").value = d.id;
        document.getElementById("itemName").value = item.name;
        document.getElementById("itemPrice").value = item.price;
        document.getElementById("itemImage").value = item.image;
        document.getElementById("itemDesc").value = item.desc;
        modalRef.show();
      };
    });
  }
