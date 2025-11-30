# fcp-to-json
Export Final Cut Pro project file format to JSON


# File Format

For this entire example, I'm going to go through the following little project where I took a 32s video, used the blade tool to cut it in half and inserted a "360° Bloom" transition in between and made it last longer.

<img width="324" height="152" alt="image" src="https://github.com/user-attachments/assets/7a1bcc29-657a-4794-b70f-d6e1a5e044c5" />

In your `Movies` folder, you can find a file ending with `.fcpbundle` that represents your project. This is just a folder that you can open on MacOS by right clicking and "Show Package Contents". You can also traverse it using normal unix or file path operations.

<img width="295" height="232" alt="image" src="https://github.com/user-attachments/assets/1d9f7954-a15d-4448-9d3f-48dd1c9f7a08" />

The content of this folder is the following:

<img width="458" height="879" alt="image" src="https://github.com/user-attachments/assets/3b3fbdfa-8779-4ce9-8535-829bd3bcc7f3" />

The files `.fcpevent` and `.flexolibrary` are SQLite databases with the same schema. You can use [DB Browser for SQLite](https://sqlitebrowser.org/) to open it on MacOS or use [node:sqlite](https://nodejs.org/api/sqlite.html) to read the content.

<img width="325" height="942" alt="image" src="https://github.com/user-attachments/assets/5a321a40-ed9a-4956-b79d-84777716507f" />

## ZCATALOGROOT

There's a single entry that links to the `ZCATALOGROOTMD` table. Since this one isn't super useful, I'm going to explain the structure in `ZCOLLECTION` section.

<img width="446" height="106" alt="image" src="https://github.com/user-attachments/assets/25faf825-ac4b-4626-8645-d02168c60b91" />

## ZCATALOGROOTMD

If you see a binary blob content starting with `bplist`, this is a json binary encoded content. I used [node-bplist-parser](https://github.com/joeferner/node-bplist-parser/) to read it:

<img width="927" height="239" alt="image" src="https://github.com/user-attachments/assets/35811421-c33f-48f6-bf8a-420487f875a3" />

The content is not overly exciting. Two entire tables for really just the `$rootObjectID`.

<img width="412" height="89" alt="image" src="https://github.com/user-attachments/assets/06650d71-36b3-4259-a957-ae558e534262" />


## Z_PRIMARYKEY

This table isn't super useful, it has metadata for the 4 main tables.

* `Z_ENT`: a unique identifier for the type entity. There's a corresponding column in these 4 tables with that value.
* `Z_NAME`: The properly capitalized name for that entity.
* `Z_SUPER`: Not sure, always `0` in my example.
* `Z_MAX`: For my example it's the number of entries in that corresponding entity table. Probably is the highest id if you delete things given the name.

<img width="288" height="183" alt="image" src="https://github.com/user-attachments/assets/723a04ec-b04c-4731-96d2-797c19440f5d" />

## Z_MODELCACHE

It's just a single binary blob under `Z_CONTENT`. I haven't tried parsing this content yet. Since it's called a cache, it's probably a derivation of the information in the other tables.

<img width="705" height="296" alt="image" src="https://github.com/user-attachments/assets/f8f87509-032a-4885-b70f-801b6b2b60e3" />

## Z_METADATA

This is another table that is just there to store a single binary blob under `Z_PLIST`.

<img width="950" height="334" alt="image" src="https://github.com/user-attachments/assets/def9be96-59a6-41d3-9c7d-1b40562c2ea6" />

The bplist content is the following:

<img width="901" height="324" alt="image" src="https://github.com/user-attachments/assets/00b9d113-223e-460b-a4d7-660ca4f10dc3" />

`NSStoreModelVersionHashesDigest` and `NSStoreModelVersionChecksumKey` are just base64 encoded binary content. Don't ask me why they decided to base64 encode these ones and not the ones just below. You can use `Buffer.from(content, 'base64')` to go from base64 to binary buffer in node.

<img width="628" height="86" alt="image" src="https://github.com/user-attachments/assets/60a8d28a-7228-4872-9653-496e49640280" />
