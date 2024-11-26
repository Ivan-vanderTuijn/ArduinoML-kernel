grammar ArduinoMl

entry App:
	'app' name=ID 'initial' 'state' initial=[State:ID]
	'{'
		'bricks'
		bricks+=Brick
		(bricks+=Brick)* 
		
		'states'
		states+=State
		( states+=State)*
	'}';

Brick :
	(Actuator | Sensor);

Actuator:
	{infer Actuator}
	'Actuator' name=ID ':' outputPin=INT;

Sensor :
	{infer Sensor}
	'Sensor'  name=ID ':' inputPin=INT;
	
State :
	name=ID '{'
		actions+=Action
		(actions+=Action)* 
		(simpleTransition=SimpleTransition)?
		(temporalTransitions+=TemporalTransition)*
	'}';

Action :
	actuator=[Actuator:ID] '<=' value=Signal;

SimpleTransition :
	condition=Condition '=>' next=[State:ID];

TemporalTransition :
	condition=Condition '=>' next=[State:ID];

TerminalCondition:
    SensorCondition;

Condition:
    DoubleCondition | SimpleCondition | TerminalCondition;

SimpleCondition:
    operator=UnaryLogicalOperator condition=Condition;

DoubleCondition:
    '(' conditionOne=Condition operator=BinaryLogicalOperator conditionTwo=Condition ')';

SensorCondition infers TerminalCondition:
    sensor=[Sensor:ID] 'is' value=Signal;

TemporalCondition infers TerminalCondition:
    'after' duration=INT;

UnaryLogicalOperator:
    value=NOT;

BinaryLogicalOperator:
    value=(AND | OR);


Signal:
    value=(HIGH | LOW);

terminal HIGH : 'HIGH';
terminal LOW : 'LOW';
terminal AND : '&&';
terminal OR : '||';
terminal NOT : '!';

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
