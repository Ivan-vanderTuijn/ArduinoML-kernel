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
    
        unsigned long startTime = millis();
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
    if (state.transition !== undefined) {
        compileSimpleTransition(state.transition, fileNode);
    }
    fileNode.append(`
            break;`);
}
function compileAction(action, fileNode) {
    var _a;
    fileNode.append(`
                digitalWrite(` + ((_a = action.actuator.ref) === null || _a === void 0 ? void 0 : _a.outputPin) + `,` + action.value.value + `);`);
}
function compileSimpleTransition(transition, fileNode) {
    var _a;
    compileCondition(transition.condition, fileNode);
    fileNode.append(`{
                    currentState = ` + ((_a = transition.next.ref) === null || _a === void 0 ? void 0 : _a.name) + `;
                    startTime = millis();
                }`);
}
function compileCondition(condition, fileNode) {
    fileNode.append(`
                if(`);
    compileConditionSwitch(condition, fileNode);
    fileNode.append(`)`);
}
function compileConditionSwitch(condition, fileNode) {
    switch (condition.$type) {
        case "SimpleCondition":
            compileSimpleCondition(condition, fileNode);
            break;
        case "DoubleCondition":
            compileDoubleCondition(condition, fileNode);
            break;
        default: // TerminalCondition
            compileTerminalConditionSwitch(condition, fileNode);
            break;
    }
}
function compileTerminalConditionSwitch(condition, fileNode) {
    switch (condition.$type) {
        case "SensorCondition":
            compileSensorCondition(condition, fileNode);
            break;
        case "TemporalCondition":
            compileTemporalCondition(condition, fileNode);
            break;
    }
}
function compileSensorCondition(condition, fileNode) {
    var _a, _b, _c;
    fileNode.append(`digitalRead(` + ((_b = (_a = condition.sensor) === null || _a === void 0 ? void 0 : _a.ref) === null || _b === void 0 ? void 0 : _b.inputPin) + `) == ` + ((_c = condition.value) === null || _c === void 0 ? void 0 : _c.value) + ``);
}
function compileTemporalCondition(condition, fileNode) {
    fileNode.append(`(millis() - startTime >= ` + condition.duration + `)`);
}
function compileSimpleCondition(condition, fileNode) {
    fileNode.append(`` + condition.operator.value + ``);
    compileConditionSwitch(condition.condition, fileNode);
}
function compileDoubleCondition(condition, fileNode) {
    fileNode.append(`(`);
    compileConditionSwitch(condition.conditionOne, fileNode);
    fileNode.append(` ` + condition.operator.value + ` `);
    compileConditionSwitch(condition.conditionTwo, fileNode);
    fileNode.append(`)`);
}
//# sourceMappingURL=generator.js.map