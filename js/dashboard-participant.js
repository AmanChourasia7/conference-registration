// GENERATE PASS

const generateBtn =
  document.getElementById("generate-pass");

if (generateBtn) {

  generateBtn.addEventListener("click", async () => {

    try {

      document.getElementById("gatepass-section").style.display =
        "block";

      // UNIQUE ENTRY ID
      const entryId =
        "OML-" +
        Math.random()
        .toString(36)
        .substring(2,10)
        .toUpperCase();

      document.getElementById("entry-id").innerText =
        entryId;

      // QR CONTENT
      const qrData = JSON.stringify({

        name: currentUserData?.name || "",

        email: currentUserData?.email || "",

        institution: currentUserData?.institution || "",

        entryId: entryId

      });

      // CLEAR OLD QR
      const qrContainer =
        document.getElementById("qrcode");

      qrContainer.innerHTML = "";

      // CREATE QR IMAGE
      const qrImage =
        document.createElement("img");

      qrImage.style.width = "180px";

      qrImage.style.height = "180px";

      qrImage.src =
        "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" +
        encodeURIComponent(qrData);

      qrContainer.appendChild(qrImage);

    }
    catch(err) {

      console.error(err);

      alert("Failed to generate pass");

    }

  });

}
