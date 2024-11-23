import fs from 'fs';
import { CompositeGeneratorNode, NL, toString } from 'langium';
import path from 'path';
import { Action, Actuator, App, Sensor, State, Transition } from '../language-server/generated/ast';
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
		if (state.transition !== null){
			compileTransition(state.transition, fileNode)
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

	function compileTransition(transition: Transition, fileNode:CompositeGeneratorNode) {
		fileNode.append(`
                if( digitalRead(`+transition.sensor.ref?.inputPin+`) == `+transition.value.value+`) {
                    currentState = `+transition.next.ref?.name+`;
                }`)
	}

