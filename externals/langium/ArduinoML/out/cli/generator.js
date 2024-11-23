"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInoFile = void 0;
const fs_1 = __importDefault(require("fs"));
const langium_1 = require("langium");
const path_1 = __importDefault(require("path"));
const cli_util_1 = require("./cli-util");
function generateInoFile(app, filePath, destination) {
    const data = (0, cli_util_1.extractDestinationAndName)(filePath, destination);
    const generatedFilePath = `${path_1.default.join(data.destination, data.name)}.ino`;
    const fileNode = new langium_1.CompositeGeneratorNode();
    compile(app, fileNode);
    if (!fs_1.default.existsSync(data.destination)) {
        fs_1.default.mkdirSync(data.destination, { recursive: true });
    }
    fs_1.default.writeFileSync(generatedFilePath, (0, langium_1.toString)(fileNode));
    return generatedFilePath;
}
exports.generateInoFile = generateInoFile;
function compile(app, fileNode) {
    var _a;
    fileNode.append(`
        // Wiring code generated from an ArduinoML model COUCOU1
        // Application name: ` + app.name + `
    
        enum STATE {` + app.states.map(s => s.name).join(', ') + `};
    
        STATE currentState = ` + ((_a = app.initial.ref) === null || _a === void 0 ? void 0 : _a.name) + `;`, langium_1.NL);
    fileNode.append(`
        void setup(){`);
    for (const brick of app.bricks) {
        if ("inputPin" in brick) {
            compileSensor(brick, fileNode);
        }
        else {
            compileActuator(brick, fileNode);
        }
    }
    fileNode.append(`
        }`, langium_1.NL);
    fileNode.append(`
        void loop() {
            switch(currentState){
        `);
    for (const state of app.states) {
        compileState(state, fileNode);
    }
    fileNode.append(`
	        }
        }`, langium_1.NL);
}
function compileActuator(actuator, fileNode) {
    fileNode.append(`
		    pinMode(` + actuator.outputPin + `, OUTPUT); // ` + actuator.name + ` [Actuator]`);
}
function compileSensor(sensor, fileNode) {
    fileNode.append(`
		    pinMode(` + sensor.inputPin + `, INPUT_PULLUP); // ` + sensor.name + ` [Sensor]`);
}
function compileState(state, fileNode) {
    fileNode.append(`
            case ` + state.name + `:`);
    for (const action of state.actions) {
        compileAction(action, fileNode);
    }
    if (state.transition !== null) {
        compileTransition(state.transition, fileNode);
    }
    fileNode.append(`
            break;`);
}
function compileAction(action, fileNode) {
    var _a;
    fileNode.append(`
                digitalWrite(` + ((_a = action.actuator.ref) === null || _a === void 0 ? void 0 : _a.outputPin) + `,` + action.value.value + `);`);
}
function compileTransition(transition, fileNode) {
    var _a, _b, _c;
    fileNode.append(`
                if(`);
    fileNode.append(`digitalRead(` + ((_a = transition.condition.primaryCondition.sensor.ref) === null || _a === void 0 ? void 0 : _a.inputPin) + `) == ` + transition.condition.primaryCondition.value.value + ``);
    for (const condition of transition.condition.secondaryConditions) {
        fileNode.append(` ` + condition.logicalOperator.value + ` digitalRead(` + ((_b = condition.right.sensor.ref) === null || _b === void 0 ? void 0 : _b.inputPin) + `) == ` + condition.right.value.value + ``);
    }
    fileNode.append(`) {
                    currentState = ` + ((_c = transition.next.ref) === null || _c === void 0 ? void 0 : _c.name) + `;
                    delay(100);
                }`);
}
//# sourceMappingURL=generator.js.map