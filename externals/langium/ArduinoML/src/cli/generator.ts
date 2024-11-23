import fs from 'fs';
import { CompositeGeneratorNode, NL, toString } from 'langium';
import path from 'path';
import {
    Action,
    Actuator,
    App, Condition,
    Sensor,
    SimpleTransition,
    State,
    TemporalTransition,
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
    
        Timer timer;`
         ,NL
     );

    fileNode.append(`
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
            timer.update();
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
		if (state.simpleTransition !== undefined){
			compileSimpleTransition(state.simpleTransition, fileNode)
		}
        if (state.temporalTransitions !== undefined && state.temporalTransitions.length !== 0){
            compileTemporalTransitions(state.temporalTransitions, fileNode)
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

	function compileSimpleTransition(transition: SimpleTransition, fileNode:CompositeGeneratorNode) {
        compileCondition(transition.condition, fileNode);
        fileNode.append(`{
                    currentState = `+transition.next.ref?.name+`;
                    delay(100);
                }`
        )
	}

    // returns : if (myCondition == 1 && myCondition2 == 0 || ...)
    function compileCondition(condition: Condition, fileNode:CompositeGeneratorNode) {
        fileNode.append(`
                if(`)
        fileNode.append(`digitalRead(`+condition.primaryCondition.sensor.ref?.inputPin+`) == `+condition.primaryCondition.value.value+``)

        for(const subCond of condition.secondaryConditions){
            fileNode.append(` `+subCond.logicalOperator.value+` digitalRead(`+subCond.right.sensor.ref?.inputPin+`) == `+subCond.right.value.value+``)
        }
        fileNode.append(`)`);
    }

    function compileTemporalTransitions(transitions: TemporalTransition[], fileNode:CompositeGeneratorNode) {
        for(const transition of transitions){
            fileNode.append(`
                timer.setTimeout([]() {`)
                if (transition.condition !== undefined) {
                    compileCondition(transition.condition, fileNode);
                    fileNode.append(`{
                    currentState = ` + transition.next.ref?.name + `;
                }`);
                }else {
                    fileNode.append(`
                    currentState = ` + transition.next.ref?.name + `;`);
                }
            fileNode.append(`
                }, ` + transition.duration + `);`
            )
        }
    }

