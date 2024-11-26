
        // Wiring code generated from an ArduinoML model COUCOU1
        // Application name: RedButton
        
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
    
        Timer timer;

        enum STATE {reset, buzzer_on, led_on};
    
        STATE currentState = reset;

        void setup(){
		    pinMode(8, OUTPUT); // red_led [Actuator]
		    pinMode(9, OUTPUT); // buzzer [Actuator]
		    pinMode(10, INPUT_PULLUP); // button [Sensor]
        }

        void loop() {
            timer.update();
            switch(currentState){
        
            case reset:
                digitalWrite(8,LOW);
                digitalWrite(9,LOW);
                if(digitalRead(10) == HIGH){
                    currentState = buzzer_on;
                    delay(100);
                }
            break;
            case buzzer_on:
                digitalWrite(8,LOW);
                digitalWrite(9,HIGH);
                if(digitalRead(10) == HIGH){
                    currentState = led_on;
                    delay(100);
                }
            break;
            case led_on:
                digitalWrite(8,HIGH);
                digitalWrite(9,LOW);
                if(digitalRead(10) == HIGH){
                    currentState = reset;
                    delay(100);
                }
            break;
	        }
        }
