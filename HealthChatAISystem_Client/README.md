# HealthChatAI-Client

1. Open `git bash` in the root of the repo
2. Remove node_modules folder using 
```sh
rm -rf node_modules
```
3. In git bash, after deleting the folder, run the following to convert all CRLF to LF recursively:
```sh
find . -type f -exec dos2unix {} \;
```
4. Reinstall node_modules
```sh
npm install
```