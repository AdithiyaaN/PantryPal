Here's a refined version of the setup instructions, organized for clarity and ease of use.

-----

### 🚀 **Quick Setup Guide**

Follow these steps to get the project up and running on your local machine.

-----

### **1. Unzip and Navigate to the Project** 📂

First, unzip the downloaded project file. Then, open your terminal (Command Prompt, PowerShell, or Terminal) and navigate into the newly created project folder using the `cd` command.

```bash
# Replace "path/to/your/project-folder" with the actual path
cd path/to/your/project-folder
```

-----

### **2. Set Your API Key** 🔑

You need to add your personal Gemini API key to the project so it can connect to the AI service.

  * Find the file named **`.env`** in the main project folder.
  * Open it with a text editor.
  * You will see the following line:
    ```
    GEMINI_API_KEY="YOUR_API_KEY_HERE"
    ```
  * Replace **`YOUR_API_KEY_HERE`** with your actual API key.
  * **Save and close** the file.

-----

### **3. Install Dependencies** 📦

Next, install all the necessary software packages the project relies on. Run the following command in your terminal:

```bash
npm install
```

This command reads the `package.json` file and downloads all the required libraries into a `node_modules` folder.

-----

### **4. Run the Application** ▶️

Now you're ready to start the local development server. Use this command:

```bash
npm run dev
```

Your terminal should show a message indicating that the server is running successfully and is listening on a port.

-----

### **5. View Your App** ✨

Finally, open your favorite web browser and go to the following address to see your app in action:

**[http://localhost:9002](https://www.google.com/search?q=http://localhost:9002)**
