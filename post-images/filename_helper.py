import os

PREFIX = "Pasted image "

def remove_prefix_from_filename(filename):
    if filename.lower().startswith(PREFIX.lower()):
        return filename[len(PREFIX):]
    return None

def main():
    for filename in os.listdir('.'):
        if os.path.isfile(filename):
            new_name = remove_prefix_from_filename(filename)
            if new_name and not os.path.exists(new_name):
                print(f"Renaming: {filename} -> {new_name}")
                os.rename(filename, new_name)
            elif new_name and os.path.exists(new_name):
                print(f"Skipping (target exists): {filename} -> {new_name}")

if __name__ == "__main__":
    main()