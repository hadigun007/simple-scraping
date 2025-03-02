
const express = require('express');
const app = express();
const PORT = 3000;
const dotenv = require('dotenv');
dotenv.config();
// =====
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
// =====
const { GoogleGenerativeAI } = require("@google/generative-ai");


app.use(express.json());
app.get('/', (req, res) => {
    res.send('Hello From Scrapper!');
});

app.get('/api/scrape', async (req, res) => {
    if(req.headers['api_key'] !== process.env.LOCAL_API_KEY) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    let data = await scrapper()
    let gen = await generate_description(data)
    res.json(gen);
});

// Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}/`);
});


async function scrapper() {

    let options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-gpu');
    options.addArguments('--disable-dev-shm-usage');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

        let products = [];

    try {
        await driver.get('https://www.orami.co.id/shopping');
        await driver.sleep(5000);
        await scrollPage(driver);
        await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'flex-container') and contains(@class, 'horizontal-scroll')]")), 10000);

        let productTiles = await driver.findElements(By.xpath("//div[contains(@class, 'product-tile')]"));


        for (let tile of productTiles) {
            let title, originalPrice, discountedPrice, discountPercentage, imageUrl;

            try {
                title = await tile.findElement(By.xpath(".//p[contains(@class, 'product-title')]")).getText();
            } catch (error) {
                title = "N/A";
            }

            try {
                originalPrice = await tile.findElement(By.xpath(".//span[contains(@class, 'original-price')]")).getText();
            } catch (error) {
                originalPrice = "N/A";
            }

            try {
                discountedPrice = await tile.findElement(By.xpath(".//div[contains(@class, 'text price text-coral')]/div")).getText();
            } catch (error) {
                discountedPrice = "N/A";
            }

            try {
                discountPercentage = await tile.findElement(By.xpath(".//span[contains(@class, 'discount-amount')]")).getText();
            } catch (error) {
                discountPercentage = "N/A";
            }

            try {
                let productLink = await tile.findElement(By.xpath("./ancestor::a")); // Find the parent <a> tag
                productDetailUrl = await productLink.getAttribute("href");
            } catch (error) {
                productDetailUrl = "N/A";
            }

            try {
                let imageElement = await tile.findElement(By.xpath(".//img[contains(@class, 'image-fit-contain')]"));
                imageUrl = await imageElement.getAttribute("src");

                if (imageUrl.startsWith("data:image")) {
                    await driver.executeScript("arguments[0].scrollIntoView(true);", imageElement);
                    await driver.wait(async () => {
                        imageUrl = await imageElement.getAttribute("src");
                        return !imageUrl.startsWith("data:image");
                    }, 50000); 

                    console.log("Actual image URL loaded:", imageUrl);
                }
            } catch (error) {
                imageUrl = "N/A"; 
            }


            products.push({
                "title": title,
                "originalPrice": originalPrice,
                "discountedPrice": discountedPrice,
                "discountPercentage": discountPercentage,
                "imageUrl": imageUrl,
                "productDetailUrl": productDetailUrl,
            })
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Quit the driver
        await driver.quit();
        return products;
    }
};
async function scrollPage(driver) {
    let totalHeight = await driver.executeScript("return document.body.scrollHeight");
    let scrollStep = 500; 
    let currentScroll = 0;

    while (currentScroll < totalHeight) {
        await driver.executeScript(`window.scrollTo(0, ${currentScroll});`);
        await driver.sleep(1000);
        currentScroll += scrollStep;
        totalHeight = await driver.executeScript("return document.body.scrollHeight");
    }

    await driver.executeScript("window.scrollTo(0, 0);");
}
async function generate_description(data) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    let batchPrompt = "Buat deskripsi persuasif dalam teks biasa untuk produk-produk berikut:\n\n";
  data.forEach((item, index) => {
    batchPrompt += `Produk ${index + 1}:\n`;
    batchPrompt += `Judul: ${item.title}\n`;
    batchPrompt += `Harga Asli: ${item.originalPrice}\n`;
    batchPrompt += `Harga Diskon: ${item.discountedPrice}\n`;
    batchPrompt += `Persentase Diskon: ${item.discountPercentage}\n\n`;
  });

  const result = await model.generateContent(batchPrompt);
  const response = await result.response;
  const descriptions = response.text().split("Produk ");

  const results = data.map((item, index) => {
    let aiGeneratedDescription = "Deskripsi tidak tersedia.";
    try {
      if (descriptions[index + 1]) {
        const descText = descriptions[index + 1];
        const colonIndex = descText.indexOf(":");
        if (colonIndex !== -1) {
          aiGeneratedDescription = descText.substring(colonIndex + 1).trim();
        } else {
          aiGeneratedDescription = descText.trim();
        }
      }
      aiGeneratedDescription = aiGeneratedDescription.replace(/[\n\r\t]+/g, " ").trim();
    } catch (error) {
      console.error(`Error processing description for product ${index + 1}:`, error);
    }

    return {
      ...item,
      "description(ai generated)": aiGeneratedDescription,
    };
  });

  return results;
    
}


