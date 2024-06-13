document.getElementById('start-scanner').addEventListener('click', function() {
    document.getElementById('video-container').style.display = 'block';
    startScanner();
});

function startScanner() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#video'),
            constraints: {
                width: 640,
                height: 480,
                facingMode: "environment"
            }
        },
        decoder: {
            readers: ["ean_reader"]
        }
    }, function(err) {
        if (err) {
            console.log(err);
            return;
        }
        console.log("QuaggaJS initialized");
        Quagga.start();
    });

    Quagga.onDetected(onDetected);
}

function stopScanner() {
    Quagga.stop();
    Quagga.offDetected(onDetected);
    document.getElementById('video-container').style.display = 'none';
}

function onDetected(data) {
    const barcode = data.codeResult.code;
    document.getElementById('barcode').innerText = barcode;
    fetchPrice(barcode);
    stopScanner();
}

async function fetchPrice(barcode) {
    const apiKey = 'YOUR_API_KEY'; // Replace with your Trolley.co.uk API key
    const url = `https://api.trolley.co.uk/v1/products/${barcode}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        const data = await response.json();
        if (data.product && data.product.prices && data.product.prices.length > 0) {
            const priceInfo = data.product.prices[0]; // Get the first price entry
            const store = priceInfo.store;
            const price = priceInfo.price;
            document.getElementById('price').innerText = `${store}: £${price}`;
        } else {
            document.getElementById('price').innerText = 'Price not found';
        }
    } catch (error) {
        console.error('Error fetching price:', error);
        document.getElementById('price').innerText = 'Error fetching price';
    }
}
