
        // Wiring code generated from an ArduinoML model COUCOU1
        // Application name: RedButton
    
        enum STATE {reset, buzzer_on, led_on};
    
        STATE currentState = reset;

        void setup(){
		    pinMode(7, OUTPUT); // red_led [Actuator]
		    pinMode(8, OUTPUT); // buzzer [Actuator]
		    pinMode(2, INPUT_PULLUP); // button [Sensor]
        }

        void loop() {
            switch(currentState){
        
            case reset:
                digitalWrite(7,LOW);
                digitalWrite(8,LOW);
                if(digitalRead(2) == LOW) {
                    currentState = buzzer_on;
                    delay(100);
                }
            break;
            case buzzer_on:
                digitalWrite(8,HIGH);
                if(digitalRead(2) == LOW) {
                    currentState = led_on;
                    delay(100);
                }
            break;
            case led_on:
                digitalWrite(7,HIGH);
                digitalWrite(8,LOW);
                if(digitalRead(2) == LOW) {
                    currentState = reset;
                    delay(100);
                }
            break;
	        }
        }
