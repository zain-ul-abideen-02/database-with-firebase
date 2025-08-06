
    import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
    import {
      getAuth,
      createUserWithEmailAndPassword,
      signInWithEmailAndPassword,
      updateProfile,
    } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
    import {
      getFirestore,
      doc,
      setDoc,
      serverTimestamp
    } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

    
    const firebaseConfig = {
      apiKey: "AIzaSyD-dEMWkAblqRDVd5-7tp6EJ0PcwfMwmAc",
      authDomain: "card-app-48b0e.firebaseapp.com",
      projectId: "card-app-48b0e",
      storageBucket: "card-app-48b0e.appspot.com",
      messagingSenderId: "334506878461",
      appId: "1:334506878461:web:your_actual_app_id"
      
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    
    const signupForm = document.getElementById("signup-form");
    const loginForm = document.getElementById("login-form");
    const showLogin = document.getElementById("show-login");
    const showSignup = document.getElementById("show-signup");

    
    if (showLogin && showSignup) {
      showLogin.addEventListener("click", () => {
        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
      });

      showSignup.addEventListener("click", () => {
        loginForm.classList.add("hidden");
        signupForm.classList.remove("hidden");
      });
    }

    
    if (signupForm) {
      signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("signup-name").value.trim();
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value.trim();

        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          await updateProfile(user, { displayName: name });

          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name,
            email,
            createdAt: serverTimestamp()
          });

          Swal.fire({
            position: "center",
            icon: "success",
            title: "✅ Sign up successful! Please login.",
            showConfirmButton: false,
            timer: 2000
          });

          signupForm.reset();
          signupForm.classList.add("hidden");
          loginForm.classList.remove("hidden");

        } catch (error) {
          console.error("Signup Error:", error.message);
          Swal.fire({
            icon: "error",
            title: "Signup Failed",
            text: error.message
          });
        }
      });
    }

    
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();

        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          Swal.fire({
            position: "center",
            icon: "success",
            title: `✅ Welcome, ${user.displayName || user.email}`,
            showConfirmButton: false,
            timer: 1500
          });

          loginForm.reset();

          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 1500);

        } catch (error) {
          console.error("Login Error:", error.message);
          Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: error.message
          });
        }
      });
    }
  