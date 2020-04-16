import { SarinaDependencyInjectionError } from './../errors/sarina-di-error';

export class ErrorBuilder {
	public _message: string;
	public _code: string;
	public _name: string;
	public _helpNotes: string[] = [];
	public _data: { [key: string]: any } = {};

	public constructor(code: string, name: string) {
		this._code = code;
		this._name = name;
	}

	public message(message: string): ErrorBuilder {
		this._message = message;
		return this;
	}
	public code(code: string) {
		this._code = code;
		return this;
	}
	public name(name: string) {
		this._name = name;
		return this;
	}
	public addNote(note: string) {
		this._helpNotes.push(note);
		return this;
	}
	public addData(key: string, value: any) {
		this._data[key] = value;
		return this;
	}

	public build() {
		let msg = `${this._code}: ${this._message}`;
		this._helpNotes.forEach((note) => {
			msg += `\n\t${note}`;
		});
		return new SarinaDependencyInjectionError(this._code, this._name, msg, this._data);
	}
}
