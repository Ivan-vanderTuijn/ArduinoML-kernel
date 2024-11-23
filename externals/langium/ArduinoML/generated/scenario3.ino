
        // Wiring code generated from an ArduinoML model COUCOU1
        // Application name: RedButton
    
        enum STATE {off, on};
    
        STATE currentState = off;

        void setup(){
		    pinMode(7, OUTPUT); // red_led [Actuator]
		    pinMode(2, INPUT_PULLUP); // button [Sensor]
        }

        void loop() {
            switch(currentState){
        
            case off:
                digitalWrite(7,LOW);
                if(digitalRead(2) == LOW) {
                    currentState = on;
                    delay(100);
                }
            break;
            case on:
                digitalWrite(7,HIGH);
                if(digitalRead(2) == LOW) {
                    currentState = off;
                    delay(100);
                }
            break;
	        }
        }
