
        // Wiring code generated from an ArduinoML model COUCOU1
        // Application name: RedButton
    
        enum STATE {off, on};
    
        STATE currentState = off;

        void setup(){
		    pinMode(7, OUTPUT); // red_led [Actuator]
		    pinMode(2, INPUT_PULLUP); // buttonA [Sensor]
		    pinMode(3, INPUT_PULLUP); // buttonB [Sensor]
        }

        void loop() {
            switch(currentState){
        
            case off:
                digitalWrite(7,LOW);
                if(digitalRead(2) == LOW && digitalRead(3) == LOW) {
                    currentState = on;
                }
            break;
            case on:
                digitalWrite(7,HIGH);
                if(digitalRead(2) == HIGH || digitalRead(3) == HIGH) {
                    currentState = off;
                }
            break;
	        }
        }
