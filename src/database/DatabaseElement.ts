export abstract class DatabaseElement {
	ID: string;

	constructor(id: string) {
		this.ID = id;
	}

	GetData(): object {
		return {};
	}
}