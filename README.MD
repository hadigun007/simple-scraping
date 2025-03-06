# Simple Scraping Test

Api sederhana untuk scraping data produk di e-commerce menggunakan selenium. tools ini dibuat untuk keperluan test fullstack developer

## Fitur

* Menghasilkan deskripsi produk persuasif dalam bahasa Indonesia.
* Menggunakan Gemini API untuk pemrosesan bahasa alami.
* API sederhana dengan satu *endpoint* untuk pengembalian data.
* *Batch processing* untuk mempercepat pemrosesan data.
* Deskripsi yang dihasilkan berupa teks biasa tanpa format.

## Instalasi

1.  Clone repository:

    ```bash
    git clone https://github.com/hadigun007/simple-scraping
    ```

2.  Masuk ke direktori proyek:

    ```bash
    cd simple-scraping
    ```

3.  Instal dependensi:

    ```bash
    npm install
    ```

4.  Buat file `.env` dan tambahkan kunci API Gemini Anda:

    ```
    mv .env-example .env
    # GEMINI_API_KEY=YOUR_API_KEY
    ```

## Penggunaan
 
1.  Jalankan server:

    ```bash
    node index.js
    ```

2.  Akses *healtcheck* API:
    ```sh
      curl -X GET http://localhost:3000
    ```

3.  Akses *endpoint* API:

    * *Endpoint*: `/api/scrape`
    * Metode: `GET`
    * *Body*: Data produk dalam format JSON.

    Contoh *CURL*:

    ```sh
      curl -X GET http://localhost:3000/api/scrape -H "api_key: justalocalsimpleapikey"
    ```

    Contoh respons:

    ```json
    [
      {
        "title": "N/A",
        "originalPrice": "N/A",
        "discountedPrice": "N/A",
        "discountPercentage": "N/A",
        "imageUrl": "[https://www.orami.co.id/shopping/promo/promo-philips-home-appliances](https://www.orami.co.id/shopping/promo/promo-philips-home-appliances)",
        "productDetailUrl": "[https://www.orami.co.id/shopping/promo/promo-philips-home-appliances](https://www.orami.co.id/shopping/promo/promo-philips-home-appliances)",
        "description(ai generated)": "Deskripsi tidak tersedia."
      },
      ...
    ]
    ```
3.  Akses *endpoint* API 2:

    * *Endpoint*: `/api/scrape/2`
    * Metode: `GET`
    * *Body*: Data produk dalam format JSON.

    Contoh *CURL*:

    ```sh
      curl -X GET http://localhost:3000/api/scrape/2 -H "api_key: justalocalsimpleapikey"
    ```

    Contoh respons:

    ```json
    [
      {
        "name":"Philips Stand Mixers - Merah - HR1559/10",
        "link":"N/A",
        "imageUrl":"https://o-cdf.oramiland.com/unsafe/core.oramiland.com/media/CACHE/images/products/164372/KITC-PHIL-728A/bcfac20b50878959ac8f54603d0a3eb1.jpg","originalPrice":"Rp696.000",
        "discountedPrice":"21%Rp696.000\nRp550.077",
        "description(ai generated)":"** Sepatu Lari Premium *   **"
      }
      ...
    ]
    ```

## Dependensi

* `express`
* `@google/generative-ai`
* `dotenv`


## Lisensi

None

## Penulis

[hadigun007](https://github.com/hadigun007)