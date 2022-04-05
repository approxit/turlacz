{
	var rootRollSets = [];
}

Root = _ value:Expression _ {
	return options.system.handleRollRootResults(value, rootRollSets);
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

Dice = &{return options.system.syntax === 'generic';} @GenericDice / &{return options.system.syntax === 'alien';} @AlienDice

GenericDice "GenericDice" = throws:Integer? dieChar:GenericDieChar dieValueRange:GenericDieValueRange {
	return options.system.handleDiceRoll(throws, dieChar.toLowerCase(), dieValueRange, rootRollSets, range());
}

GenericDieChar = "k"i / "d"i

GenericDieValueRange = "100" / "20" / "12" / "10" / "8" / "6" / "4" / "2" {
	return parseInt(text());
}

AlienDice "AlienDice" = throws:Integer? dieChar:AlienDieChar {
	return options.system.handleDiceRoll(throws, dieChar.toLowerCase(), 6, rootRollSets, range());
}

AlienDieChar = "n"i / "s"i

Integer "integer" = "-"? [0-9]+ {
	return parseInt(text());
}

_ "whitespace" = [ \t\n\r]*