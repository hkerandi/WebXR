const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let scene;
let array = [];
let currentCage = null;
let elementContainers = [];
let cageCapacity = 2; // Initial capacity of the cage
const peachColor = "#FFDAB9"; // Define Peach color
let codeTextBlock;

// Setting up a basic scene
const createScene = async function () {
    scene = new BABYLON.Scene(engine);

    // Create a basic light
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);
    light.intensity = 0.7;

    // Create a camera and attach it to the canvas
    const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 20, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 5;

    return scene;
};

const createBox = (index, size, color) => {
    const box = BABYLON.MeshBuilder.CreateBox(`box${index}`, { size: size }, scene);
    box.position = new BABYLON.Vector3(index * 2, 0, 0);
    const boxMaterial = new BABYLON.StandardMaterial(`boxMaterial${index}`, scene);
    boxMaterial.diffuseColor = BABYLON.Color3.FromHexString(color);
    box.material = boxMaterial;

    //Calculating the position to centre boxes within the cage
    const boxSize = size;
    const cageSize = cageCapacity * 2;
    const boxSpacing = boxSize * 1.5; // Adjust spacing as needed
    const totalWidth = (array.length - 1) * boxSpacing + boxSize; // Total width of boxes

    // Center boxes in the cage
    box.position = new BABYLON.Vector3(-totalWidth / 2 + (index * boxSpacing) + boxSize / 2, 0, 0);

    return box;
};

const createCage = (capacity) => {
    if (currentCage) {
        currentCage.dispose(); // Remove old cage
    }

    currentCage = new BABYLON.Mesh("cage", scene);
    const cageSize = capacity * 2; // Adjust size based on capacity

    // Create cage walls
    const frontWall = BABYLON.MeshBuilder.CreateBox("frontWall", { size: cageSize, height: 1, depth: 0.1 }, scene);
    const backWall = BABYLON.MeshBuilder.CreateBox("backWall", { size: cageSize, height: 1, depth: 0.1 }, scene);
    const leftWall = BABYLON.MeshBuilder.CreateBox("leftWall", { size: 0.1, height: 1, depth: cageSize }, scene);
    const rightWall = BABYLON.MeshBuilder.CreateBox("rightWall", { size: 0.1, height: 1, depth: cageSize }, scene);

    frontWall.position = new BABYLON.Vector3(0, 0, -cageSize / 2);
    backWall.position = new BABYLON.Vector3(0, 0, cageSize / 2);
    leftWall.position = new BABYLON.Vector3(-cageSize / 2, 0, 0);
    rightWall.position = new BABYLON.Vector3(cageSize / 2, 0, 0);

    currentCage.addChild(frontWall);
    currentCage.addChild(backWall);
    currentCage.addChild(leftWall);
    currentCage.addChild(rightWall);
};

const updateCage = () => {
    if (array.length > cageCapacity) {
        garbageCollectCage();
    } else {
        createCage(cageCapacity);
        updateVisualization();
    }
};

const garbageCollectCage = () => {
    // Remove the current cage and create a larger one
    currentCage.dispose();
    cageCapacity *= 2; // Double the capacity
    createCage(cageCapacity);
    updateVisualization();
};

const updateVisualization = () => {
    elementContainers.forEach(box => box.dispose()); // Clear old boxes
    elementContainers = [];

    array.forEach((element, index) => {
        const box = createBox(index, 1, peachColor);
        box.position = new BABYLON.Vector3(index * 2, 0, 0);
        elementContainers.push(box);
    });
};

const createCodePanel = () => {
    const codePlane = BABYLON.Mesh.CreatePlane("codePlane", 8, scene);
    codePlane.position = new BABYLON.Vector3(0, 2, -3);
    codePlane.rotation = new BABYLON.Vector3(0, Math.PI, 0);

    const codeTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(codePlane);
    codeTextBlock = new BABYLON.GUI.TextBlock();
    codeTextBlock.text = "";
    codeTextBlock.color = "white";
    codeTextBlock.fontSize = 20;
    codeTextBlock.textWrapping = true;
    codeTexture.addControl(codeTextBlock);
};

const updateCodeVisualization = (action) => {
    let codeText = `
class DynamicArray:
    def __init__(self):
        self.size = 0
        self.capacity = ${cageCapacity}
        self.array = [None] * self.capacity

    def add(self, element):
        if self.size == self.capacity:
            self._grow()
        self.array[self.size] = element
        self.size += 1

    def _grow(self):
        new_capacity = self.capacity * 2
        new_array = [None] * new_capacity
        for i in range(self.size):
            new_array[i] = self.array[i]
        self.array = new_array
        self.capacity = new_capacity
    `;

    if (action === 'add') {
        codeText += `\n\n# Action: Adding an element\nself.add(element)`;
    } else if (action === 'remove') {
        codeText += `\n\n# Action: Removing an element\nself.remove()`;
    }

    codeTextBlock.text = codeText;
};

const createButtons = () => {
    const buttonPlane = BABYLON.Mesh.CreatePlane("buttonPlane", 4, scene);
    buttonPlane.position = new BABYLON.Vector3(4, 4, 0); // Move buttons to the right
    buttonPlane.rotation = new BABYLON.Vector3(Math.PI, 0, 0);

    const buttonTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(buttonPlane);
    const panel = new BABYLON.GUI.StackPanel();
    buttonTexture.addControl(panel);

    const addButton = BABYLON.GUI.Button.CreateSimpleButton("addButton", "Add Element");
    addButton.width = "200px";
    addButton.height = "50px";
    addButton.color = "white";
    addButton.background = "green";
    addButton.onPointerUpObservable.add(() => {
        const element = prompt("Enter a number to add:");
        if (element !== null && !isNaN(element)) {
            array.push(parseInt(element));
            updateCage();
            updateCodeVisualization('add');
        }
    });
    panel.addControl(addButton);

    const removeButton = BABYLON.GUI.Button.CreateSimpleButton("removeButton", "Remove Element");
    removeButton.width = "200px";
    removeButton.height = "50px";
    removeButton.color = "white";
    removeButton.background = "red";
    removeButton.onPointerUpObservable.add(() => {
        if (array.length > 0) {
            array.pop();
            updateCage();
            updateCodeVisualization('remove');
        } else {
            alert("Array is empty. Cannot remove elements.");
        }
    });
    panel.addControl(removeButton);
};

// Initialize the scene and create UI elements
createScene().then(() => {
    createCage(cageCapacity);
    createButtons();
    createCodePanel();
    engine.runRenderLoop(() => {
        scene.render();
    });

    window.addEventListener("resize", () => {
        engine.resize();
    });
}).catch(err => {
    console.error("Error creating scene:", err);
});
