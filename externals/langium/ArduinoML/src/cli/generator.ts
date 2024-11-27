import fs from 'fs';
import { CompositeGeneratorNode, NL, toString } from 'langium';
import path from 'path';
import {
    Action,
    Actuator,
    App, Condition, DoubleCondition,
    Sensor, SensorCondition, SimpleCondition,
    State, TemporalCondition,
    TerminalCondition, Transition,
} from '../language-server/generated/ast';
import { extractDestinationAndName } from './cli-util';

export function generateInoFile(app: App, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.ino`;

    const fileNode = new CompositeGeneratorNode();
    compile(app,fileNode)


    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return generatedFilePath;
}


function compile(app:App, fileNode:CompositeGeneratorNode){
    fileNode.append(`
        // Wiring code generated from an ArduinoML model COUCOU1
        // Application name: `+app.name+`
        enum STATE {`+app.states.map(s => s.name).join(', ')+`};
    
        unsigned long startTime = millis();
        STATE currentState = `+app.initial.ref?.name+`;`
        ,NL
    );

    fileNode.append(`
        void setup(){`
    );
    for(const brick of app.bricks){
        if ("inputPin" in brick){
       		compileSensor(brick,fileNode);
		}else{
            compileActuator(brick,fileNode);
        }
	}
    fileNode.append(`
        }`
    ,NL);

    fileNode.append(`
        void loop() {
            switch(currentState){
        `
    )
    for(const state of app.states){
        compileState(state, fileNode)
    }
	fileNode.append(`
	        }
        }`
    ,NL);
}

	function compileActuator(actuator: Actuator, fileNode: CompositeGeneratorNode) {
        fileNode.append(`
		    pinMode(`+actuator.outputPin+`, OUTPUT); // `+actuator.name+` [Actuator]`
        )
    }

	function compileSensor(sensor:Sensor, fileNode: CompositeGeneratorNode) {
    	fileNode.append(`
		    pinMode(`+sensor.inputPin+`, INPUT_PULLUP); // `+sensor.name+` [Sensor]`
        )
	}

    function compileState(state: State, fileNode: CompositeGeneratorNode) {
        fileNode.append(`
            case `+state.name+`:`
        )
		for(const action of state.actions){
			compileAction(action, fileNode)
		}
		if (state.transition !== undefined){
			compileSimpleTransition(state.transition, fileNode)
		}
		fileNode.append(`
            break;`
        )
    }


	function compileAction(action: Action, fileNode:CompositeGeneratorNode) {
		fileNode.append(`
                digitalWrite(`+action.actuator.ref?.outputPin+`,`+action.value.value+`);`
        )
	}

	function compileSimpleTransition(transition: Transition, fileNode:CompositeGeneratorNode) {
        compileCondition(transition.condition, fileNode);
        fileNode.append(`{
                    currentState = `+transition.next.ref?.name+`;
                    startTime = millis();
                }`
        )
	}

    function compileCondition(condition: Condition, fileNode:CompositeGeneratorNode) {
        fileNode.append(`
                if(`);
        compileConditionSwitch(condition, fileNode);
        fileNode.append(`)`);
    }

    function compileConditionSwitch(condition: Condition, fileNode:CompositeGeneratorNode) {
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

function compileTerminalConditionSwitch(condition: TerminalCondition, fileNode:CompositeGeneratorNode) {
    switch (condition.$type) {
        case "SensorCondition":
            compileSensorCondition(condition, fileNode);
            break;
        case "TemporalCondition":
            compileTemporalCondition(condition, fileNode);
            break;
    }
}

    function compileSensorCondition(condition: SensorCondition, fileNode:CompositeGeneratorNode) {
        fileNode.append(`digitalRead(`+condition.sensor?.ref?.inputPin+`) == `+condition.value?.value+``);
    }

    function compileTemporalCondition(condition: TemporalCondition, fileNode:CompositeGeneratorNode) {
        fileNode.append(`(millis() - startTime >= `+condition.duration+`)`);    }

    function compileSimpleCondition(condition: SimpleCondition, fileNode:CompositeGeneratorNode) {
        fileNode.append(``+condition.operator.value+``);
        compileConditionSwitch(condition.condition, fileNode);
    }

    function compileDoubleCondition(condition: DoubleCondition, fileNode:CompositeGeneratorNode) {
        fileNode.append(`(`);
        compileConditionSwitch(condition.conditionOne, fileNode);
        fileNode.append(` `+condition.operator.value+` `);
        compileConditionSwitch(condition.conditionTwo, fileNode);
        fileNode.append(`)`);
    }