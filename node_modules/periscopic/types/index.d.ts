declare module 'periscopic' {
	export function analyze(expression: import('estree').Node): {
		map: WeakMap<import("estree").Node, Scope>;
		scope: Scope;
		globals: Map<string, import("estree").Node>;
	};

	export function extract_names(param: import('estree').Node): string[];

	export function extract_identifiers(param: import('estree').Node, nodes?: import('estree').Identifier[]): import('estree').Identifier[];
	export class Scope {
		
		constructor(parent: Scope | null, block: boolean);
		
		parent: Scope | null;
		
		block: boolean;
		
		declarations: Map<string, import('estree').Node>;
		
		initialised_declarations: Set<string>;
		
		references: Set<string>;
		
		add_declaration(node: import('estree').VariableDeclaration | import('estree').ClassDeclaration): void;
		
		find_owner(name: string): Scope | null;
		
		has(name: string): boolean;
	}
}

//# sourceMappingURL=index.d.ts.map