import { walk } from 'zimmerframe';
import is_reference from 'is-reference';

/** @param {import('estree').Node} expression */
export function analyze(expression) {
	/** @typedef {import('estree').Node} Node */

	/** @type {WeakMap<Node, Scope>} */
	const map = new WeakMap();

	/** @type {Map<string, Node>} */
	const globals = new Map();

	const scope = new Scope(null, false);

	/** @type {[Scope, import('estree').Identifier][]} */
	const references = [];

	/** @type {Scope} */
	let current_scope = scope;

	/**
	 * @param {import('estree').Node} node
	 * @param {boolean} block
	 */
	function push(node, block) {
		map.set(node, (current_scope = new Scope(current_scope, block)));
	}

	walk(/** @type {import('estree').Node} */ (expression), null, {
		_(node, context) {
			switch (node.type) {
				case 'Identifier':
					const parent = context.path.at(-1);
					if (parent && is_reference(node, parent)) {
						references.push([current_scope, node]);
					}
					return;

				case 'ImportSpecifier':
					current_scope.declarations.set(node.local.name, node);
					return;
				case 'ExportNamedDeclaration':
					if (node.source) {
						map.set(node, (current_scope = new Scope(current_scope, true)));
						for (const specifier of node.specifiers) {
							current_scope.declarations.set(specifier.local.name, specifier);
						}
						return;
					}
					break;

				case 'FunctionExpression':
				case 'FunctionDeclaration':
				case 'ArrowFunctionExpression':
					if (node.type === 'FunctionDeclaration') {
						if (node.id) {
							current_scope.declarations.set(node.id.name, node);
						}

						push(node, false);
					} else {
						push(node, false);

						if (node.type === 'FunctionExpression' && node.id) {
							current_scope.declarations.set(node.id.name, node);
						}
					}

					for (const param of node.params) {
						for (const name of extract_names(param)) {
							current_scope.declarations.set(name, node);
						}
					}
					break;

				case 'ForStatement':
				case 'ForInStatement':
				case 'ForOfStatement':
				case 'BlockStatement':
				case 'SwitchStatement':
					push(node, true);
					break;

				case 'ClassDeclaration':
				case 'VariableDeclaration':
					current_scope.add_declaration(node);
					break;

				case 'CatchClause':
					push(node, true);

					if (node.param) {
						for (const name of extract_names(node.param)) {
							if (node.param) {
								current_scope.declarations.set(name, node.param);
							}
						}
					}
					break;
			}

			context.next();

			if (map.has(node) && current_scope !== null && current_scope.parent) {
				current_scope = current_scope.parent;
			}
		}
	});

	for (let i = references.length - 1; i >= 0; --i) {
		const [scope, reference] = references[i];

		if (!scope.references.has(reference.name)) {
			add_reference(scope, reference.name);
		}
		if (!scope.find_owner(reference.name)) {
			globals.set(reference.name, reference);
		}
	}

	return { map, scope, globals };
}

/**
 * @param {Scope} scope
 * @param {string} name
 */
function add_reference(scope, name) {
	scope.references.add(name);
	if (scope.parent) add_reference(scope.parent, name);
}

export class Scope {
	/**
	 * @param {Scope | null} parent
	 * @param {boolean} block
	 */
	constructor(parent, block) {
		/** @type {Scope | null} */
		this.parent = parent;

		/** @type {boolean} */
		this.block = block;

		/** @type {Map<string, import('estree').Node>} */
		this.declarations = new Map();

		/** @type {Set<string>} */
		this.initialised_declarations = new Set();

		/** @type {Set<string>} */
		this.references = new Set();
	}

	/**
	 * @param {import('estree').VariableDeclaration | import('estree').ClassDeclaration} node
	 */
	add_declaration(node) {
		if (node.type === 'VariableDeclaration') {
			if (node.kind === 'var' && this.block && this.parent) {
				this.parent.add_declaration(node);
			} else {
				for (const declarator of node.declarations) {
					for (const name of extract_names(declarator.id)) {
						this.declarations.set(name, node);
						if (declarator.init) this.initialised_declarations.add(name);
					}
				}
			}
		} else if (node.id) {
			this.declarations.set(node.id.name, node);
		}
	}

	/**
	 * @param {string} name
	 * @returns {Scope | null}
	 */
	find_owner(name) {
		if (this.declarations.has(name)) return this;
		return this.parent && this.parent.find_owner(name);
	}

	/**
	 * @param {string} name
	 * @returns {boolean}
	 */
	has(name) {
		return (
			this.declarations.has(name) || (!!this.parent && this.parent.has(name))
		);
	}
}

/**
 * @param {import('estree').Node} param
 * @returns {string[]}
 */
export function extract_names(param) {
	return extract_identifiers(param).map((node) => node.name);
}

/**
 * @param {import('estree').Node} param
 * @param {import('estree').Identifier[]} nodes
 * @returns {import('estree').Identifier[]}
 */
export function extract_identifiers(param, nodes = []) {
	switch (param.type) {
		case 'Identifier':
			nodes.push(param);
			break;

		case 'MemberExpression':
			let object = param;
			while (object.type === 'MemberExpression') {
				object = /** @type {any} */ (object.object);
			}
			nodes.push(/** @type {any} */ (object));
			break;

		case 'ObjectPattern':
			for (const prop of param.properties) {
				if (prop.type === 'RestElement') {
					extract_identifiers(prop.argument, nodes);
				} else {
					extract_identifiers(prop.value, nodes);
				}
			}

			break;

		case 'ArrayPattern':
			for (const element of param.elements) {
				if (element) extract_identifiers(element, nodes);
			}

			break;

		case 'RestElement':
			extract_identifiers(param.argument, nodes);
			break;

		case 'AssignmentPattern':
			extract_identifiers(param.left, nodes);
			break;
	}

	return nodes;
}
