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
	'after' duration=INT (logicalOperator=LogicalOperator (condition=Condition)+)? '=>' next=[State:ID];

Condition:
    primaryCondition=PrimaryCondition
    (secondaryConditions+=SecondaryCondition)*;

PrimaryCondition:
    sensor=[Sensor:ID] 'is' value=Signal;

SecondaryCondition:
    logicalOperator=LogicalOperator right=PrimaryCondition;

LogicalOperator:
    value=(AND | OR);

Signal:
    value=(HIGH | LOW);

terminal HIGH : 'HIGH';
terminal LOW : 'LOW';
terminal AND : '&&';
terminal OR : '||';

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
