
export class LSystem {

	constructor(axiom, rules) {
		
		
		this.axiom = [];
		this.result = [];
		if (axiom) {
			this.axiom.push(...axiom);
			this.result.push(...axiom);
		} 
		
		this.rules = {};
		if(rules) {
			Object.assign(this.rules, rules);
		}
		
		return this;
	}
		
	iterate() {
		let resultLength = this.result.length;
		let new_res = [];
		
		let ch, rp;
		for (let i = 0; i < resultLength; ++i) {
			ch = this.result[i]; // get the current command
			// if there isn't a rule for the command...
			if (!this.rules[ch]) {
				new_res.push(ch); // just push the character
			} else {
				// else, use the replacement rule
				rp = this.rules[ch];
				new_res.push(...rp);
			}
		}
		
		this.result = new_res;
		
		return this;
	}
	
	set(src) {
		this.axiom = [];
		this.axiom.push(...src.axiom);
		
		this.result = [];
		this.result.push(...src.axiom);
		
		this.rules = {};
		Object.assign(this.rules, src.rules);
		
		return this;
	}
}