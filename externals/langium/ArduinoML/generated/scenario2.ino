
        // Wiring code generated from an ArduinoML model COUCOU1
        // Application name: RedButton
        enum STATE {off, on};
    
        unsigned long startTime = millis();
        STATE currentState = off;

        void setup(){
		    pinMode(7, OUTPUT); // red_led [Actuator]
		    pinMode(2, INPUT_PULLUP); // buttonA [Sensor]
		    pinMode(3, INPUT_PULLUP); // buttonB [Sensor]
        }

        void loop() {
            timer.update();
            switch(currentState){
        
            case off:
                digitalWrite(7,LOW);
                if(!(digitalRead(2) == HIGH && (digitalRead(2) == LOW || digitalRead(3) == LOW))){
                    currentState = on;
                    startTime = millis();
                    delay(100);
                }
            break;
            case on:
                digitalWrite(7,HIGH);
                if((digitalRead(2) == HIGH || digitalRead(3) == HIGH)){
                    currentState = off;
                    startTime = millis();
                    delay(100);
                }
            break;
	        }
        }
