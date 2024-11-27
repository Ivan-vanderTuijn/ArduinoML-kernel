
        // Wiring code generated from an ArduinoML model COUCOU1
        // Application name: RedButton
        enum STATE {off, on, buzz};
    
        unsigned long startTime = millis();
        STATE currentState = off;

        void setup(){
		    pinMode(7, OUTPUT); // red_led [Actuator]
		    pinMode(8, OUTPUT); // buzzer [Actuator]
		    pinMode(2, INPUT_PULLUP); // button [Sensor]
        }

        void loop() {
            switch(currentState){
        
            case off:
                digitalWrite(7,LOW);
                digitalWrite(8,LOW);
                if(digitalRead(2) == LOW){
                    currentState = on;
                    startTime = millis();
                }
            break;
            case on:
                digitalWrite(7,HIGH);
                if(((millis() - startTime >= 800) && digitalRead(2) == HIGH)){
                    currentState = off;
                    startTime = millis();
                }
            break;
            case buzz:
                digitalWrite(8,HIGH);
                if(digitalRead(2) == HIGH){
                    currentState = off;
                    startTime = millis();
                }
            break;
	        }
        }
