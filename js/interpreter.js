var Interpreter = function (source, tape, pointer,
                            out, awaitInput, instruction) {
    /*
     * Brainfuck Interpreter Class
     * @source: Brainfuck script
     * @tape: Tape model
     * @pointer: Pointer model
     * @out: Output callback
     * @awaitInput: Input callback
     *
     * Usage:
     *
     *    var interpreter = new Interpreter(">", tape, pointer);
     *    interpreter.next()
     *    pointer.get("index") // 1
     *
     * */
    var tokens = "<>+-.,[]";
    var jumps = [], action = 0;

    var error = function (message) {
        return {
            "name": "Error",
            "message": message
        };
    };

    this.next = function (optimize) {
        if (action >= source.length) {
            if (jumps.length === 0) throw {
                "name": "End",
                "message": "End of brainfuck script."
            };
            else {
                throw error("Mismatched parentheses.");
            }
        }
        // Skip non-code characters
        if (tokens.indexOf(source[action]) === -1) {
            action++;
            return this.next(optimize);
        }
        var index = pointer.get("index");
        if (index < 0 || index >= tape.models.length) {
            throw error("Memory error: " + index);
        }
        instruction(action);
        var token = source[action];
        var cell = tape.models[index];
        switch (token) {
        case "<":
            lookahead = 1;
            while(optimize&&source[action+lookahead]==="<"){
              lookahead++;
            }
            action += lookahead - 1;
            pointer.left(lookahead);
            break;

        case ">":
            lookahead = 1;
            while(optimize&&source[action+lookahead]===">"){
              lookahead++;
            }
            action += lookahead - 1;
            pointer.right(lookahead);
            break;

        case "-":
            lookahead = 1;
            while(optimize&&source[action+lookahead]==="-"){
              lookahead++;
            }
            action += lookahead - 1;
            cell.dec(lookahead);
            break;

        case "+":
            lookahead = 1;
            while(optimize&&source[action+lookahead]==="+"){
              lookahead++;
            }
            action += lookahead - 1;
            cell.inc(lookahead);
            break;

        case ",":
            awaitInput(cell);
            break;

        case ".":
            out(cell);
            break;

        case "[":
            if(optimize&&source[action+1]==="-"&&source[action+2]==="]"){
              cell.set("value",0);
            }
            if (cell.get("value") != 0) {
                jumps.push(action);
            } else {
                var loops = 1;
                while (loops > 0) {
                    action++;
                    if (action >= source.length) {
                        throw error("Mismatched parentheses.");
                    }
                    
                    if (source[action] === "]") {
                        loops--;
                    } else if (source[action] === "[") {
                        loops++;
                    }
                }
            }
            break;

        case "]":
            if (jumps.length === 0) {
                throw error("Mismatched parentheses.");
            }

            if (cell.get("value") != 0) {
                action = jumps[jumps.length - 1];
            } else {
                jumps.pop();
            }
        }
        return action++;
    }
};
