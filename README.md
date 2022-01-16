# bsocial-cli
> Bitcoin Social (BitcoinSchema) Command Line Interface

bsocial-cli is a cli tool to post to the BitcoinSchema network.

bsocial-cli use https://whatsonchain.com to interact with the Bitcoin blockchain.

NOTE: This is a proof of concept. Do not store your real life identity or BSV in this wallet.

## global installation

```shell
npm install -g bsocial-cli
```

To run the program using the build in wizard
```shell
bsocial-cli
```

You will need to run the wizard at least once, to import an identity and keys to use.

You can create an identity at https://blockpost.network and export it for use here on the Profile page.

## Usage

To post a markdown message directly to the BSocial network (you can get the profile name from the list of profiles while running the wizard):
```shell
bsocial-cli -p [profile name] -m "# Hello World"
```

To post a markdown message directly to the BSocial network by piping the output of a command to the `bsocial-cli`
```shell
cat README.md | bsocial-cli -p [profile name]
```
