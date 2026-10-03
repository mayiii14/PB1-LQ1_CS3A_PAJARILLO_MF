// Store the current user and RSA keys
let currentUser = null;
let publicKey = null;
let privateKey = null;

/* Sign up the user */
function signUp() {

    // Get the form values
    const name = document.getElementById("name").value.trim();
    const birthday = document.getElementById("birthday").value;
    const yearLevel = document.getElementById("yearLevel").value;
    const gender = document.getElementById("gender").value;
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    // Check if all fields are filled
    if (!name || !birthday || !yearLevel || !gender || !username || !password) {
        showMessage("Please complete all fields.", "red");
        return;
    }

    // Check if an account already exists
    if (localStorage.getItem("rsaUser")) {
        showMessage("An account already exists.", "red");
        return;
    }

    // Save the user's information
    currentUser = { name, birthday, yearLevel, gender, username, password };
    localStorage.setItem("rsaUser", JSON.stringify(currentUser));

    // Show the account information
    displayUserInformation(currentUser);

    showMessage("Sign-up successful! Choose an RSA key size.", "green");

    // Change the visible sections
    document.getElementById("signupPanel").classList.add("hidden");
    document.getElementById("rsaPanel").classList.remove("hidden");
    document.getElementById("userPanel").classList.remove("hidden");
}

/* Display the user's information */
function displayUserInformation(user) {

    document.getElementById("displayName").textContent = user.name;
    document.getElementById("displayBirthday").textContent =
        formatBirthday(user.birthday);
    document.getElementById("displayYear").textContent = user.yearLevel;
    document.getElementById("displayGender").textContent = user.gender;
    document.getElementById("displayUsername").textContent = user.username;
}

/* Format the birthday */
function formatBirthday(date) {

    return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

/* Generate the RSA keys */
function generateRSA(keySize) {

    // Check if JSEncrypt is loaded
    if (typeof JSEncrypt === "undefined") {
        showMessage("JSEncrypt could not be loaded.", "red");
        return;
    }

    // Make sure the user has signed up
    if (!currentUser) {
        showMessage("Please sign up first.", "red");
        return;
    }

    document.getElementById("keySize").textContent =
        "Generating RSA-" + keySize + " key...";

    // Create the RSA key pair
    const rsa = new JSEncrypt({ default_key_size: keySize });

    rsa.getKey();

    publicKey = rsa.getPublicKey();
    privateKey = rsa.getPrivateKey();

    document.getElementById("keySize").textContent =
        "RSA-" + keySize + " key generated successfully.";

    // Select the information to encrypt
    const data = JSON.stringify({
        name: currentUser.name,
        username: currentUser.username,
        yearLevel: currentUser.yearLevel,
        gender: currentUser.gender
    });

    // Encrypt using the public key
    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(publicKey);

    const encrypted = encryptor.encrypt(data);

    if (!encrypted) {
        document.getElementById("encryptedData").value =
            "Encryption failed.";
        return;
    }

    // Show the encrypted data
    document.getElementById("encryptedData").value = encrypted;

    // Decrypt the data using the private key
    decryptRSA(encrypted);
}

/* Decrypt the RSA data */
function decryptRSA(encryptedText) {

    if (!privateKey) return;

    // Use the private key to decrypt
    const decryptor = new JSEncrypt();
    decryptor.setPrivateKey(privateKey);

    const decrypted = decryptor.decrypt(encryptedText);

    if (!decrypted) {
        document.getElementById("decryptedData").value =
            "Decryption failed.";
        return;
    }

    // Show the decrypted information
    const data = JSON.parse(decrypted);

    document.getElementById("decryptedData").value =
        "Full Name: " + data.name + "\n" +
        "Username: " + data.username + "\n" +
        "Year Level: " + data.yearLevel + "\n" +
        "Gender: " + data.gender;
}

/* Show messages on the page */
function showMessage(text, color) {

    const message = document.getElementById("message");

    message.textContent = text;
    message.style.color = color;
}

/* Log out the current user */
function logout() {

    // Clear the current user and RSA keys
    currentUser = null;
    publicKey = null;
    privateKey = null;

    // Show the sign-up form again
    document.getElementById("signupPanel").classList.remove("hidden");
    document.getElementById("rsaPanel").classList.add("hidden");
    document.getElementById("userPanel").classList.add("hidden");

    // Clear the displayed RSA results
    document.getElementById("encryptedData").value = "";
    document.getElementById("decryptedData").value = "";

    document.getElementById("keySize").textContent =
        "No RSA key generated.";

    showMessage("You have been logged out.", "green");
}

/* Clear the saved account */
function clearAccount() {

    localStorage.removeItem("rsaUser");

    showMessage("Saved account has been cleared.", "green");
}
