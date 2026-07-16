#!/usr/bin/env python3
"""Delete one top-level TypeScript, TSX, or Python function with PolyglotPiranha."""

import argparse
import json
import re
from importlib.metadata import version
from pathlib import Path

from polyglot_piranha import PiranhaArguments, Rule, RuleGraph, execute_piranha


SIMPLE_RULE_SET_VERSION = "simple-top-level-function-v1"
EXPORTED_RULE_SET_VERSION = "barrel-exported-function-v1"
PYTHON_RULE_SET_VERSION = "simple-top-level-python-function-v1"
IDENTIFIER = re.compile(r"^[A-Za-z_$][A-Za-z0-9_$]*$")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", required=True)
    parser.add_argument("--symbol", required=True)
    parser.add_argument("--language", choices=("typescript", "tsx", "python"), required=True)
    parser.add_argument("--allow-exported", action="store_true")
    args = parser.parse_args()

    source_path = Path(args.file).resolve()
    if not source_path.is_file():
        raise ValueError(f"Source file not found: {source_path}")
    if not IDENTIFIER.fullmatch(args.symbol):
        raise ValueError(f"Unsupported symbol identifier: {args.symbol}")

    if args.language == "python" and args.allow_exported:
        raise ValueError("Exported Python removal is outside the simple remediation scope")

    if args.language == "python":
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
        name="delete_confirmed_dead_top_level_function",
        query=query,
        replace_node="declaration",
        replace="",
        is_seed_rule=True,
    )
    summaries = execute_piranha(
        PiranhaArguments(
            language=args.language,
            paths_to_codebase=[str(source_path)],
            rule_graph=RuleGraph(rules=[rule], edges=[]),
            dry_run=False,
            delete_consecutive_new_lines=args.language != "python",
            delete_file_if_empty=False,
        )
    )
    rewrite_count = sum(len(summary.rewrites) for summary in summaries)
    changed_paths = [summary.path for summary in summaries if summary.rewrites]
    print(
        json.dumps(
            {
                "rewrite_count": rewrite_count,
                "changed_paths": changed_paths,
                "generator_version": version("polyglot-piranha"),
                "rule_set_version": (
                    PYTHON_RULE_SET_VERSION
                    if args.language == "python"
                    else (
                        EXPORTED_RULE_SET_VERSION
                        if args.allow_exported
                        else SIMPLE_RULE_SET_VERSION
                    )
                ),
            }
        )
    )


if __name__ == "__main__":
    main()
