# fcp-to-json
Export Final Cut Pro project file format to JSON

# File Format

For this entire example, I'm going to go through the following little project where I took a 32s video, used the blade tool to cut it in half and inserted a "360° Bloom" transition in between and made it last longer.

<img width="324" height="152" alt="image" src="https://github.com/user-attachments/assets/7a1bcc29-657a-4794-b70f-d6e1a5e044c5" />

In your `Movies` folder, you can find a file ending with `.fcpbundle` that represents your project. This is just a folder that you can open on MacOS by right clicking and "Show Package Contents". You can also traverse it using normal unix or file path operations.

<img width="295" height="232" alt="image" src="https://github.com/user-attachments/assets/1d9f7954-a15d-4448-9d3f-48dd1c9f7a08" />

The content of this folder is the following:

<img width="458" height="879" alt="image" src="https://github.com/user-attachments/assets/3b3fbdfa-8779-4ce9-8535-829bd3bcc7f3" />

# .fcpevent

The files `.fcpevent` and `.flexolibrary` are SQLite databases with the same schema. You can use [DB Browser for SQLite](https://sqlitebrowser.org/) to open it on MacOS or use [node:sqlite](https://nodejs.org/api/sqlite.html) to read the content.

<img width="325" height="942" alt="image" src="https://github.com/user-attachments/assets/5a321a40-ed9a-4956-b79d-84777716507f" />

## ZCATALOGROOT & ZCATALOGROOTMD

While this project only has one catalog, I assume that you can have many different catalogs and these two tables lists them out. `ZCATALOGROOT` looks like the following:

* `Z_PK` is the unique identifier for that catalog. This is referenced by the `ZCATALOG` column in `ZCOLLECTION` table.
* `Z_ENT` is the entity number defined in `Z_PRIMARYKEY` table. In my case it's always `1`.
* `Z_OPT`, I'm not really sure what it is about.
* `Z_METADATA` is a reference to the field `Z_PK` in the `ZCATALOGROOTMD` (`MD` stands for `metadata`).
* `Z_IDENTIFIER` is a `UUID` column, but it seems to be always `NULL` for `ZCATALOGROOT` (it's not in `ZCOLLECTION`).
* `Z_NAME` seems to be `$ROOT_CATALOG`.

<img width="446" height="106" alt="image" src="https://github.com/user-attachments/assets/25faf825-ac4b-4626-8645-d02168c60b91" />

With the `Z_METADATA`, we can get the metadata information from `ZCATALOGROOTMD`.

* `Z_PK` is the identifier to be associated with `Z_METADATA`
* `Z_ENT` is the entity number defined in `Z_PRIMARYKEY` table. In my case it's always `2`.
* `Z_OPT`, I'm not really sure what it is about.
* `Z_CATALOG` is a back reference to the `Z_PK` of the `ZCATALOGROOT` table it is linked from.
* `Z_IDENTIFIER` is a `UUID` column, but it seems to be always `NULL` for `ZCATALOGROOTMD` (it's not in `ZCOLLECTION`).
* `ZDICTIONARYDATA` is the where the actual information is in. See below for how to read it.

<img width="927" height="239" alt="image" src="https://github.com/user-attachments/assets/35811421-c33f-48f6-bf8a-420487f875a3" />

If you see a binary blob content starting with `bplist`, this is a json binary encoded content. I used [node-bplist-parser](https://github.com/joeferner/node-bplist-parser/) to read it. The important piece of information is `$rootObjectID` which is the `ZIDENTIFIER` column in `ZCOLLECTION` for the object of `ZTYPE` `FFMediaEventProject`.

<img width="412" height="89" alt="image" src="https://github.com/user-attachments/assets/06650d71-36b3-4259-a957-ae558e534262" />

## ZCOLLECTION & ZCOLLECTIONMD

This is where the bulk of the content resides. Let's first discuss the structure of the two tables. For `ZCOLLECTION`:

* `Z_PK` is the unique identifier for that entry.
* `Z_ENT` is the entity number defined in `Z_PRIMARYKEY` table. In my case it's always `3`.
* `Z_OPT`, I'm not really sure what it is about. It goes from `0` to `11` in my example.
* `Z_FLAGS`, I'm not really sure what it is about. It is either `0` or `1` in my example.
* `Z_METADATA` is a reference to the field `Z_PK` in the `ZCOLLECTIONMD` (`MD` stands for `metadata`). It can be `NULL`.
* `Z_IDENTIFIER` is a either a `UUID` if `ZNAME` is `NULL` or `NULL` if `ZNAME` is not `NULL`.
* `Z_NAME` seems to be the `ZTYPE` is a raw collection (`NSSet` or `NSArray`) or `NULL` if the `ZTYPE` is a custom `ZTYPE` (eg: `FFEffectStack`).
* `ZTYPE` is the Objective-C class name that's used to deserialize the metadata into.

<img width="981" height="347" alt="image" src="https://github.com/user-attachments/assets/4ed37815-e0f7-45de-b391-f4176aedcb55" />

The actual content of the entry lives in `ZCOLLECTIONMD`. With the `Z_METADATA`, we can get the metadata information from `ZCATALOGROOTMD`.

* `Z_PK` is the identifier to be associated with `Z_METADATA`
* `Z_ENT` is the entity number defined in `Z_PRIMARYKEY` table. In my case it's always `4`.
* `Z_OPT`, I'm not really sure what it is about.
* `Z_COLLECTION` is a back reference to the `Z_PK` of the `ZCOLLECTION` table it is linked from.
* `Z_IDENTIFIER` is a `UUID` column, but it seems to be always `NULL` for `ZCOLLECTIONMD` (it's not in `ZCOLLECTION`).
* `ZDICTIONARYDATA` is the where the actual information is in encoded as a bplist.

<img width="984" height="300" alt="image" src="https://github.com/user-attachments/assets/3645ff29-1b3e-4981-99a6-a2b5909961b1" />

These are all the types that exist in my sample project:

### FFAnchoredCollection

<img width="421" height="549" alt="image" src="https://github.com/user-attachments/assets/fd583133-3391-407e-8981-72060f3dac8b" />

### FFAnchoredMediaComponent

<img width="286" height="156" alt="image" src="https://github.com/user-attachments/assets/7006e6c5-a786-4ae1-a3f8-307f35ee3368" />

### FFAnchoredSequence

<img width="319" height="173" alt="image" src="https://github.com/user-attachments/assets/b8c14183-15cb-4f9c-9244-6e6bc6d5500d" />

### FFAnchoredTransition

<img width="353" height="242" alt="image" src="https://github.com/user-attachments/assets/f12f3a28-f756-4b5e-9b6e-6b123f8c7ada" />

### FFAssetRef

<img width="384" height="69" alt="image" src="https://github.com/user-attachments/assets/8f4288f5-86c7-478d-9a26-f2216f88332f" />

### FFAudioClipComponentsLayoutMap

<img width="422" height="20" alt="image" src="https://github.com/user-attachments/assets/17627c82-76ba-4b16-8948-5b8b3f309f1c" />

### FFAudioTransitionEffect

<img width="629" height="136" alt="image" src="https://github.com/user-attachments/assets/cf291918-ae89-4437-9129-52be2ddcf8de" />

### FFEffectStack

<img width="355" height="19" alt="image" src="https://github.com/user-attachments/assets/8c135a73-5839-4d04-a839-8e57cd8cbb78" />

### FFHeColorEffect

<img width="258" height="121" alt="image" src="https://github.com/user-attachments/assets/81f75937-bb5b-4a98-afaf-544b10899f89" />

### FFHeConformEffect

<img width="627" height="135" alt="image" src="https://github.com/user-attachments/assets/72a7377b-a121-44ee-b7cf-ad766b02f5f6" />

### FFIntrinsicColorConformEffect

<img width="315" height="86" alt="image" src="https://github.com/user-attachments/assets/8bec734b-8ae8-4fde-af73-31f63498de1e" />

### FFMediaEventFolder

<img width="399" height="18" alt="image" src="https://github.com/user-attachments/assets/b9a42744-8331-4683-ae64-74d0489c3d27" />

### FFMediaEventProject

<img width="642" height="612" alt="image" src="https://github.com/user-attachments/assets/66b602ed-5e0a-4eec-8f1b-12e5b4760886" />

### FFMediaEventProjectData

<img width="265" height="21" alt="image" src="https://github.com/user-attachments/assets/1bd5584e-2622-4595-8a88-b2b288d1504a" />

### FFMediaRep

<img width="373" height="1015" alt="image" src="https://github.com/user-attachments/assets/387aaa68-600e-4bd4-9774-422277c7a436" />

### FFMotionEffect

<img width="651" height="158" alt="image" src="https://github.com/user-attachments/assets/2a379539-e527-49c1-9b07-c76c6afd4a8f" />

### FFSequenceInfo

<img width="476" height="377" alt="image" src="https://github.com/user-attachments/assets/395b617c-fd1b-4423-b567-62e40a9d0f71" />

### FFUserDefaults

<img width="273" height="496" alt="image" src="https://github.com/user-attachments/assets/3bec03bd-0c47-4407-b31a-d08677d6aa2b" />

### containedItems

<img width="310" height="122" alt="image" src="https://github.com/user-attachments/assets/f714faa1-f22d-4519-9ca3-027acae62950" />

### intrinsicEffects

<img width="308" height="123" alt="image" src="https://github.com/user-attachments/assets/166bb1b1-d4ef-49dd-9f9a-2bccd0d418c1" />

## Z_3CHILDCOLLECTIONS

I'm very confused by this one. This is a list of `[parent, child]` pairs where each number is a `ZCOLLECTION` `Z_PK`. But the data doesn't really fit a parent-child relationships. Some nodes are the parent of multiple children (normal) and some nodes are the children of multiple parents (not normal). There are also cycles in the graph if you consider them edges.

<img width="388" height="323" alt="image" src="https://github.com/user-attachments/assets/67769dd6-5696-4f10-b523-260b76935784" />

## Z_METADATA

This is another table that is just there to store a single binary blob under `Z_PLIST`.

<img width="950" height="334" alt="image" src="https://github.com/user-attachments/assets/def9be96-59a6-41d3-9c7d-1b40562c2ea6" />

The bplist content is the following:

<img width="901" height="324" alt="image" src="https://github.com/user-attachments/assets/00b9d113-223e-460b-a4d7-660ca4f10dc3" />

`NSStoreModelVersionHashesDigest` and `NSStoreModelVersionChecksumKey` are just base64 encoded binary content. Don't ask me why they decided to base64 encode these ones and not the ones just below. You can use `Buffer.from(content, 'base64')` to go from base64 to binary buffer in node.

<img width="628" height="86" alt="image" src="https://github.com/user-attachments/assets/60a8d28a-7228-4872-9653-496e49640280" />

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

# .plist

There's a lot of `Info.plist` files that all have the same structure:

<img width="772" height="841" alt="image" src="https://github.com/user-attachments/assets/f91cbe03-14f1-41f7-ae3a-639a54e5e970" />

The overall plist file is a JSON object serialized as XML.

There are two composite types:
* `<dict>`: the children are a sequence of `<key>string</key>` and values.
* `<array>`: the children are a sequence of values.

And many primitive types:
* `<real>-1.0</real>`: a floating point value.
* `<integer>10</integer>`: an integer value.
* `<string>a string</string>`: a string.
* `<data>base64</data>`: this is a base64 encoded value. You need to remove all the whitespace and new lines. You can use `Buffer.from(content, 'base64')` to go from base64 to binary buffer in node.
  * In many cases the value is encoded in the bplist format.

<img width="635" height="512" alt="image" src="https://github.com/user-attachments/assets/e6fede1e-ce2d-4ebb-be14-ad7f48fce950" />

## CurrentVersion.plist and Settings.plist

These are not the most interesting files but writing them here for completeness.

<img width="479" height="190" alt="image" src="https://github.com/user-attachments/assets/f28d973a-c1cd-45ae-99c2-64d85c3f0cf1" />

# Frame X - Y

[Need to write]
