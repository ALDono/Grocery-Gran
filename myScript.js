document.getElementById('start-scanner').addEventListener('click', function() {
    document.getElementById('cameraInput').click();
});

document.getElementById('cameraInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Initialize QuaggaJS with the image
                Quagga.decodeSingle({
                    src: img.src,
                    numOfWorkers: 0, // Needs to be 0 when used with decodeSingle
                    inputStream: {
                        size: 800 // restrict input-size to be 800px in width (long-side)
                    },
                    decoder: {
                        readers: ["ean_reader"] // List of active readers
                    }
                }, function(result) {
                    if (result && result.codeResult) {
                        const barcode = result.codeResult.code;
                        document.getElementById('barcode').innerText = barcode;
                        fetchPrice(barcode); // Fetch price with the scanned barcode
                    } else {
                        document.getElementById('barcode').innerText = 'Barcode not detected';
                    }
                });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

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
