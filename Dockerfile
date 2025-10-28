FROM apify/actor-node-puppeteer-chrome:20

COPY package*.json ./

RUN npm --quiet set progress=false \
    && npm install --only=prod --no-optional \
    && echo "Installed NPM packages:" \
    && (npm list --only=prod --no-optional --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version \
    && rm -r ~/.npm

COPY . ./

CMD npm start
```

5. Click **"Commit changes"**

---

### **Option B: If You Already Added It**

Check that:
- Filename is **`Dockerfile`** (not `Dockerfile.txt` or `dockerfile`)
- It's in the **root** of the repository (same level as `main.js`)
- Capital `D` is important!

---

## 📁 **Verify Your Files**

Your repo should look like this:
```
WitAI/
├── .actor/
│   └── actor.json
├── Dockerfile              ← Must be here, capital D
├── INPUT_SCHEMA.json
├── main.js
├── package.json
└── README.md
```

---

## 🔄 **After Adding Dockerfile**

1. **Commit** the Dockerfile to GitHub
2. Go back to **Apify**
3. Go to **Builds** tab
4. Click **"Build"** again
5. This time you should see: `"Using Dockerfile from repository"`

---

## ⏳ **Current Build**

Your current build might still complete successfully even with the default Dockerfile, **but it won't have Chrome/Puppeteer properly installed**, so the Actor will still fail.

Wait for the current build to finish, then:
- Add the Dockerfile
- Rebuild with the correct Docker image

---

## 📋 **What the Correct Build Should Say**

When using the right Dockerfile, you'll see:
```
ACTOR: Cloning https://github.com/Wisewood/WitAI
ACTOR: Found Dockerfile at ./Dockerfile
ACTOR: Building container image.
Step 1/X : FROM apify/actor-node-puppeteer-chrome:20
...
Successfully built [image-id]
