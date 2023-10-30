import sys


def add_dependencies(package_json_path, dependencies):
    with open(package_json_path, "r+") as f:
        content = f.read()
        for dependency in dependencies:
            if dependency not in content:
                content = content.replace('"dependencies": {', '"dependencies": {\n    ' + dependency + ",")
                f.seek(0)
                f.write(content)


def add_dependencies_to_json(package_json_path):
    add_dependencies(
        package_json_path,
        [
            '"react-pivottable": "^0.11.0"',
            '"react-plotly.js": "^2.6.0"',
            '"plotly.js": "^2.21.0"',
            '"react-to-print": "^2.14.13"',
            '"chart.js": "^4.2.1"',
        ]
    )


if __name__ == "__main__":

    if len(sys.argv) != 2:
        print("Need path to a package.json as input argument.")
        sys.exit(1)

    add_dependencies_to_json(sys.argv[1])
