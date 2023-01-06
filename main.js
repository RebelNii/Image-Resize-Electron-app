//setup electron

//1. instantiate electron
const path = require("path");
const os = require("os");
const fs = require("fs");
const imgResized = require("resize-img");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");

process.env.NODE_ENV = "production";

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";

let mainWindow;
let aboutWindow;

//create main window
//we can have multiple windows
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: isDev ? 1000 : 600,
    height: 600,
    title: "Image Resizer",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "./preload.js"),
    },
  });

  //open dev tools if in dev environment
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, "./public/index.html"));
}

//creating about window(page)
function createABoutWindow() {
  aboutWindow = new BrowserWindow({
    width: isDev ? 1000 : 600,
    height: 600,
    title: "Image Resizer",
  });

  //open dev tools if in dev environment
  if (isDev) {
    aboutWindow.webContents.openDevTools();
  }

  aboutWindow.loadFile(path.join(__dirname, "./public/about.html"));
}

//when app is ready
app.whenReady().then(() => {
  createMainWindow();

  //set custom menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  //remove mainwindow from memory when closed
  mainWindow.on("closed", () => (mainWindow = null));

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

//customize app menu

const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: createABoutWindow,
            },
          ],
        },
      ]
    : []),
  {
    // label: 'File',
    // submenu: [
    //     {
    //         label: 'Quit',
    //         click: () => app.quit(),
    //         accelerator: 'CmdOrCtrl+W'//means a shortcut to exec func
    //     }
    // ]
    role: "fileMenu",
  },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: createABoutWindow,
            },
          ],
        },
      ]
    : []),
];

//catch ipcRenderer
ipcMain.on("image:resize", (e, options) => {
  options.dest = path.join(os.homedir(), "Downloads", "sort");
  console.log(options);
  ImageResized(options);
});

async function ImageResized({ imgPath, width, height, dest }) {
  try {
    const resized = await imgResized(fs.readFileSync(imgPath), {
      //height & width are supposed to be int but they are received as strings so we just add + to convert them to int
      width: +width,
      height: +height,
    });

    const fileNamed = path.basename(imgPath);

    //check if route exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    fs.writeFileSync(path.join(dest, fileNamed), resized);

    //send msg to render.js
    mainWindow.webContents.send("image:done");

    //open folder
    shell.openPath(dest);
  } catch (err) {
    console.log(err);
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// ipcMain.on("some-event", (event) => {
//   /** */
//   let win = BrowserWindow.getFocusedWindow(); // get active window
//   win.loadFile("2nd html.html"); // refresh html file
//   /** OR */
//   win.loadURL("remote URL.html"); // refresh html file from a remote link

//   win.reload(); // if necessary
// });
