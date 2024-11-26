
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

        enum STATE {off, on};
    
        STATE currentState = off;

        void setup(){
		    pinMode(8, OUTPUT); // red_led [Actuator]
		    pinMode(9, OUTPUT); // buzzer [Actuator]
		    pinMode(10, INPUT_PULLUP); // button [Sensor]
        }

        void loop() {
            timer.update();
            switch(currentState){
        
            case off:
                digitalWrite(8,LOW);
                digitalWrite(9,LOW);
                if(digitalRead(10) == HIGH){
                    currentState = on;
                    delay(100);
                }
            break;
            case on:
                digitalWrite(8,HIGH);
                digitalWrite(9,HIGH);
                if(digitalRead(10) == LOW){
                    currentState = off;
                    delay(100);
                }
            break;
	        }
        }
