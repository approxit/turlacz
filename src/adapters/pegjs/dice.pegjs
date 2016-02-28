{
	var rootRollSets = [];

	function makeDieRoll(dieValueRange) {
		if (options['mockedRolls']) {
			return options['mockedRolls'].shift();
		}
		return Math.floor((dieValueRange * Math.random()) + 1);
	}

	if (options['system'] === undefined) {
		options['system'] = {};
	}
}

Root = _ value:Expression _ {
	var result;
	if (options['system'].handleRootResults !== undefined) {
		result = options['system'].handleRootResults(value, rootRollSets);
	}
	else {
		result = {
			sum: Math.round(value),
			flags: null,
		};
	}

	return {
		...result,
		rollCount: rootRollSets.reduce((p, c) => p + c.rolls.length, 0),
		rollSets: rootRollSets,
	};
}

Expression = AddSub

AddSub = head:MulDiv tail:(_ @("+" / "-") _ @MulDiv)* {
	return tail.reduce(function(result, element) {
		if (element[0] === "+") return result + element[1];
		if (element[0] === "-") return result - element[1];
	}, head);
}

MulDiv = head:Atom tail:(_ @("*" / "/") _ @Atom)* {
	return tail.reduce(function(result, element) {
		if (element[0] === "*") return result * element[1];
		if (element[0] === "/") return result / element[1];
	}, head);
}

Atom = Dice / Integer / "(" _ @Expression _ ")"

Dice = &{return options['system'].syntax === 'generic';} @GenericDice / &{return options['system'].syntax === 'alien';} @AlienDice

GenericDice "GenericDice" = throws:Integer? GenericDieChar dieValueRange:GenericDieValueRange {
	var throws = throws || 1;
	var sum = 0;
	var rolls = [];
	var rollsFlags = null;
	var throwResult, throwRolls, firstRoll, roll;

	for (var i = 0; i < throws; ++i) {
		throwResult = firstRoll = makeDieRoll(dieValueRange);
		throwRolls = [{
			value: firstRoll,
			flags: null
		}];

		if ((dieValueRange == 20) && ((firstRoll == 20) || (firstRoll == 1))) {
			throwRolls[0].flags = rollsFlags = firstRoll == 20;

			if (options.diceExplosion) {
				do {
					roll = makeDieRoll(dieValueRange);
					throwRolls.push({
						value: roll,
						flags: null
					});
					throwResult += roll;
				}
				while (roll == 20);

				if (firstRoll === 1) {
					throwResult = firstRoll - throwResult;
				}
			}

			for (var j = 0; j < throwRolls.length - 1; ++j) {
				throwRolls[j].flags = firstRoll == 20;
			}
		}

		sum += throwResult;
		rolls = rolls.concat(throwRolls);
	}

	rootRollSets.push({
		range: range(),
		rolls: rolls,
		flags: rollsFlags,
		sum: sum,
	});

	return sum;
}

GenericDieChar = "k"i / "d"i

GenericDieValueRange = "100" / "20" / "12" / "10" / "8" / "6" / "4" / "2" {
	return parseInt(text());
}

AlienDice "AlienDice" = throws:Integer? dieChar:AlienDieChar {
	var throws = throws || 1;
	var sum = 0;
	var rollResult, roll;
	var rolls = [];
	var rollsFlags = null;

	for (var i = 0; i < throws; ++i) {
		rollResult = makeDieRoll(6);
		var flags = null;
		if (dieChar === 'n' && rollResult === 6) {
			flags = true;
			if (rollsFlags !== false) {
				rollsFlags = true;
			}
		}
		if (dieChar === 's' && rollResult === 1) {
			flags = rollsFlags = false;
		}

		rolls.push({
			value: rollResult,
			flags: flags,
		});

		if (dieChar === 'n') {
			sum += rollResult == 6;
		}
	}

	var rollsSum = rollsFlags === false ? -1 : sum

	rootRollSets.push({
		range: range(),
		rolls: rolls,
		flags: rollsFlags,
		sum: rollsSum,
	});

	return rollsSum;
}

AlienDieChar = "n"i / "s"i

Integer "integer" = "-"? [0-9]+ {
	return parseInt(text());
}

_ "whitespace" = [ \t\n\r]*