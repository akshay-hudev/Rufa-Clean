#!/usr/bin/env python3
"""Delete one narrowly-supported top-level declaration with PolyglotPiranha."""

import argparse
import json
import re
from importlib.metadata import version
from pathlib import Path

from polyglot_piranha import PiranhaArguments, Rule, RuleGraph, execute_piranha


SIMPLE_RULE_SET_VERSION = "simple-top-level-function-v1"
EXPORTED_RULE_SET_VERSION = "barrel-exported-function-v1"
PYTHON_RULE_SET_VERSION = "simple-top-level-python-function-v1"
DEFAULT_EXPORT_ALIAS_RULE_SET_VERSION = "default-export-alias-v1"
EXPORTED_VARIABLE_FUNCTION_RULE_SET_VERSION = "exported-variable-function-v1"
IDENTIFIER = re.compile(r"^[A-Za-z_$][A-Za-z0-9_$]*$")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", required=True)
    parser.add_argument("--symbol", required=True)
    parser.add_argument(
        "--language",
        choices=("javascript", "typescript", "tsx", "python"),
        required=True,
    )
    parser.add_argument(
        "--shape",
        choices=(
            "top_level_function",
            "default_export_alias",
            "exported_variable_function",
        ),
        default="top_level_function",
    )
    parser.add_argument("--allow-exported", action="store_true")
    args = parser.parse_args()

    source_path = Path(args.file).resolve()
    if not source_path.is_file():
        raise ValueError(f"Source file not found: {source_path}")
    if not IDENTIFIER.fullmatch(args.symbol):
        raise ValueError(f"Unsupported symbol identifier: {args.symbol}")

    if args.language == "python" and args.allow_exported:
        raise ValueError("Exported Python removal is outside the simple remediation scope")
    if args.language == "python" and args.shape == "default_export_alias":
        raise ValueError("Python has no supported default-export alias removal")
    if args.language == "python" and args.shape == "exported_variable_function":
        raise ValueError("Python has no supported exported-variable function removal")

    if args.shape == "default_export_alias":
        query = """(program
          (export_statement
            value: (identifier)) @declaration)"""
    elif args.shape == "exported_variable_function":
        query = f'''(program
          (export_statement
            declaration: (lexical_declaration
              (variable_declarator
                name: (identifier) @name
                (#eq? @name "{args.symbol}")))) @declaration)'''
    elif args.language == "python":
        query = f'''(module
          (function_definition
            name: (identifier) @name
            (#eq? @name "{args.symbol}")) @declaration)'''
    elif args.allow_exported:
        query = f'''(program
          (export_statement
            declaration: (function_declaration
              name: (identifier) @name
              (#eq? @name "{args.symbol}"))) @declaration)'''
    else:
        query = f'''(program
          (function_declaration
            name: (identifier) @name
            (#eq? @name "{args.symbol}")) @declaration)'''
    rule = Rule(
        name="delete_dead_code_candidate",
        query=query,
        replace_node="declaration",
        replace="",
        is_seed_rule=True,
    )
    # PolyglotPiranha 0.4.8 does not expose a separate JavaScript language and
    # filters TypeScript inputs by extension, even though its grammar accepts
    # plain ECMAScript. Run against a byte-for-byte .ts mirror, then copy the
    # single Piranha rewrite back to the real .js path.
    piranha_language = "typescript" if args.language == "javascript" else args.language
    piranha_path = source_path
    mirror_path = None
    if args.language == "javascript":
        mirror_path = source_path.with_name(f".{source_path.name}.piranha.ts")
        mirror_path.write_bytes(source_path.read_bytes())
        piranha_path = mirror_path
    try:
        summaries = execute_piranha(
            PiranhaArguments(
                language=piranha_language,
                paths_to_codebase=[str(piranha_path)],
                rule_graph=RuleGraph(rules=[rule], edges=[]),
                dry_run=False,
                delete_consecutive_new_lines=args.language != "python",
                delete_file_if_empty=False,
            )
        )
        rewrite_count = sum(len(summary.rewrites) for summary in summaries)
        if mirror_path is not None and rewrite_count:
            source_path.write_bytes(mirror_path.read_bytes())
        changed_paths = [
            str(source_path) if mirror_path is not None else summary.path
            for summary in summaries
            if summary.rewrites
        ]
    finally:
        if mirror_path is not None:
            mirror_path.unlink(missing_ok=True)
    print(
        json.dumps(
            {
                "rewrite_count": rewrite_count,
                "changed_paths": changed_paths,
                "generator_version": version("polyglot-piranha"),
                "rule_set_version": (
                    DEFAULT_EXPORT_ALIAS_RULE_SET_VERSION
                    if args.shape == "default_export_alias"
                    else EXPORTED_VARIABLE_FUNCTION_RULE_SET_VERSION
                    if args.shape == "exported_variable_function"
                    else (
                        PYTHON_RULE_SET_VERSION
                        if args.language == "python"
                        else (
                            EXPORTED_RULE_SET_VERSION
                            if args.allow_exported
                            else SIMPLE_RULE_SET_VERSION
                        )
                    )
                ),
            }
        )
    )


if __name__ == "__main__":
    main()
