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
        
        class Timer {
          private:
            unsigned long startTime;
            unsigned long duration;
            bool running;
            void (*callback)();
        
          public:
            Timer() {
              running = false;
            }
        
            void setTimeout(void (*cb)(), unsigned long d) {
              if (!running) {
                callback = cb;
                duration = d;
                startTime = millis();
                running = true;
              }
            }
        
            void update() {
              if (running && (millis() - startTime >= duration)) {
                running = false;
                callback();
              }
            }
        
            void cancel() {
              running = false;
            }
        };
    
        Timer timer;`, langium_1.NL);
    fileNode.append(`
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
            timer.update();
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
    if (state.simpleTransition !== undefined) {
        compileSimpleTransition(state.simpleTransition, fileNode);
    }
    if (state.temporalTransitions !== undefined && state.temporalTransitions.length !== 0) {
        compileTemporalTransitions(state.temporalTransitions, fileNode);
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
                    delay(100);
                }`);
}
// returns : if (myCondition == 1 && myCondition2 == 0 || ...)
function compileCondition(condition, fileNode) {
    var _a, _b;
    fileNode.append(`
                if(`);
    fileNode.append(`digitalRead(` + ((_a = condition.primaryCondition.sensor.ref) === null || _a === void 0 ? void 0 : _a.inputPin) + `) == ` + condition.primaryCondition.value.value + ``);
    for (const subCond of condition.secondaryConditions) {
        fileNode.append(` ` + subCond.logicalOperator.value + ` digitalRead(` + ((_b = subCond.right.sensor.ref) === null || _b === void 0 ? void 0 : _b.inputPin) + `) == ` + subCond.right.value.value + ``);
    }
    fileNode.append(`)`);
}
function compileTemporalTransitions(transitions, fileNode) {
    var _a, _b;
    for (const transition of transitions) {
        fileNode.append(`
                timer.setTimeout([]() {`);
        if (transition.condition !== undefined) {
            compileCondition(transition.condition, fileNode);
            fileNode.append(`{
                    currentState = ` + ((_a = transition.next.ref) === null || _a === void 0 ? void 0 : _a.name) + `;
                }`);
        }
        else {
            fileNode.append(`
                    currentState = ` + ((_b = transition.next.ref) === null || _b === void 0 ? void 0 : _b.name) + `;`);
        }
        fileNode.append(`
                }, ` + transition.duration + `);`);
    }
}
//# sourceMappingURL=generator.js.map