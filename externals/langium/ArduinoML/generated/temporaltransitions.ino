
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
		    pinMode(7, OUTPUT); // red_led [Actuator]
		    pinMode(2, INPUT_PULLUP); // button [Sensor]
        }

        void loop() {
            timer.update();
            switch(currentState){
        
            case off:
                digitalWrite(7,LOW);
                if(digitalRead(2) == LOW){
                    currentState = on;
                    delay(100);
                }
            break;
            case on:
                digitalWrite(7,HIGH);
                timer.setTimeout([]() {
                if(digitalRead(2) == HIGH){
                    currentState = off;
                }
                }, 800);
                timer.setTimeout([]() {
                    currentState = off;
                }, 400);
            break;
	        }
        }
