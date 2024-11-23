
        // Wiring code generated from an ArduinoML model COUCOU1
        // Application name: RedButton
    
        enum STATE {off, on};
    
        STATE currentState = off;

        void setup(){
		    pinMode(7, OUTPUT); // red_led [Actuator]
		    pinMode(13, OUTPUT); // buzzer [Actuator]
		    pinMode(2, INPUT_PULLUP); // button [Sensor]
        }

        void loop() {
            switch(currentState){
        
            case off:
                digitalWrite(7,LOW);
                digitalWrite(13,LOW);
                if( digitalRead(2) == LOW) {
                    currentState = on;
                }
            break;
            case on:
                digitalWrite(7,HIGH);
                digitalWrite(13,HIGH);
                if( digitalRead(2) == HIGH) {
                    currentState = off;
                }
            break;
	        }
        }
