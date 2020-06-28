# Teaching-HEIGVD-RES-2020-Labo-Orchestra

## Admin

-   **You can work in groups of 2 students**.
-   It is up to you if you want to fork this repo, or if you prefer to work in a private repo. However, you have to **use exactly the same directory structure for the validation procedure to work**.
-   We expect that you will have more issues and questions than with other labs (because we have a left some questions open on purpose). Please ask your questions on Telegram / Teams, so that everyone in the class can benefit from the discussion.

## Objectives

This lab has 4 objectives:

-   The first objective is to **design and implement a simple application protocol on top of UDP**. It will be very similar to the protocol presented during the lecture (where thermometers were publishing temperature events in a multicast group and where a station was listening for these events).

-   The second objective is to get familiar with several tools from **the JavaScript ecosystem**. You will implement two simple **Node.js** applications. You will also have to search for and use a couple of **npm modules** (i.e. third-party libraries).

-   The third objective is to continue practicing with **Docker**. You will have to create 2 Docker images (they will be very similar to the images presented in class). You will then have to run multiple containers based on these images.

-   Last but not least, the fourth objective is to **work with a bit less upfront guidance**, as compared with previous labs. This time, we do not provide a complete webcast to get you started, because we want you to search for information (this is a very important skill that we will increasingly train). Don't worry, we have prepared a fairly detailed list of tasks that will put you on the right track. If you feel a bit overwhelmed at the beginning, make sure to read this document carefully and to find answers to the questions asked in the tables. You will see that the whole thing will become more and more approachable.

## Requirements

In this lab, you will **write 2 small NodeJS applications** and **package them in Docker images**:

-   the first app, **Musician**, simulates someone who plays an instrument in an orchestra. When the app is started, it is assigned an instrument (piano, flute, etc.). As long as it is running, every second it will emit a sound (well... simulate the emission of a sound: we are talking about a communication protocol). Of course, the sound depends on the instrument.

-   the second app, **Auditor**, simulates someone who listens to the orchestra. This application has two responsibilities. Firstly, it must listen to Musicians and keep track of **active** musicians. A musician is active if it has played a sound during the last 5 seconds. Secondly, it must make this information available to you. Concretely, this means that it should implement a very simple TCP-based protocol.

![image](images/joke.jpg)

### Instruments and sounds

The following table gives you the mapping between instruments and sounds. Please **use exactly the same string values** in your code, so that validation procedures can work.

| Instrument | Sound       |
| ---------- | ----------- |
| `piano`    | `ti-ta-ti`  |
| `trumpet`  | `pouet`     |
| `flute`    | `trulu`     |
| `violin`   | `gzi-gzi`   |
| `drum`     | `boum-boum` |

### TCP-based protocol to be implemented by the Auditor application

-   The auditor should include a TCP server and accept connection requests on port 2205.
-   After accepting a connection request, the auditor must send a JSON payload containing the list of <u>active</u> musicians, with the following format (it can be a single line, without indentation):

```
[
  {
  	"uuid" : "aa7d8cb3-a15f-4f06-a0eb-b8feb6244a60",
  	"instrument" : "piano",
  	"activeSince" : "2016-04-27T05:20:50.731Z"
  },
  {
  	"uuid" : "06dbcbeb-c4c8-49ed-ac2a-cd8716cbf2d3",
  	"instrument" : "flute",
  	"activeSince" : "2016-04-27T05:39:03.211Z"
  }
]
```

### What you should be able to do at the end of the lab

You should be able to start an **Auditor** container with the following command:

```
$ docker run -d -p 2205:2205 res/auditor
```

You should be able to connect to your **Auditor** container over TCP and see that there is no active musician.

```
$ telnet IP_ADDRESS_THAT_DEPENDS_ON_YOUR_SETUP 2205
[]
```

You should then be able to start a first **Musician** container with the following command:

```
$ docker run -d res/musician piano
```

After this, you should be able to verify two points. Firstly, if you connect to the TCP interface of your **Auditor** container, you should see that there is now one active musician (you should receive a JSON array with a single element). Secondly, you should be able to use `tcpdump` to monitor the UDP datagrams generated by the **Musician** container.

You should then be able to kill the **Musician** container, wait 10 seconds and connect to the TCP interface of the **Auditor** container. You should see that there is now no active musician (empty array).

You should then be able to start several **Musician** containers with the following commands:

```
$ docker run -d res/musician piano
$ docker run -d res/musician flute
$ docker run -d res/musician flute
$ docker run -d res/musician drum
```

When you connect to the TCP interface of the **Auditor**, you should receive an array of musicians that corresponds to your commands. You should also use `tcpdump` to monitor the UDP trafic in your system.

## Task 1: design the application architecture and protocols

| #        | Topic                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Question | How can we represent the system in an **architecture diagram**, which gives information both about the Docker containers, the communication protocols and the commands?                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|          | ![infrastructure diagram](./images/architecture-diagram.svg)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Question | Who is going to **send UDP datagrams** and **when**?                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
|          | Every musician container will be sending an UDP datagram once per second from the moment it is started.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Question | Who is going to **listen for UDP datagrams** and what should happen when a datagram is received?                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
|          | The auditor container will be listening for UDP datagrams and will store the source musician in a variable in order to be able to serve it later.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Question | What **payload** should we put in the UDP datagrams?                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
|          | The first thing explicitly asked to put in the datagram is the sound emmited by the musician. To make the auditor serve a uuid for each musician, we decided to also add the self-asigned uuid of the musician.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Question | What **data structures** do we need in the UDP sender and receiver? When will we update these data structures? When will we query these data structures?                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
|          | The musician will include an UUID that will be generated upon construction and broadcasted every second. He will also need a `const Map` to store the correspondance between instruments and sounds, used upon construction to find out the sound to emmit based on the instrument provided as a container argument. The auditor will also need a `const Map` for instruments and sounds but in the reverse order: it should be able to tell from a received sound which instrument emmited it; it will be queried each time a sound is heared. The auditor also needs an other (but non-const) `Map` to store the details about the active musicians. The key for this map will be the musician uuid and the value will be an object containing the instrument, the first seen moment (momentjs object) and the last seen moment. This map will be updated each time a sound is heared and 5 seconds after a sound is heared (to forget inactive musicians). It will be read each time a TCP connection is received to return a formatted array of active musicians to the client. |

## Task 2: implement a "musician" Node.js application

| #        | Topic                                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Question | In a JavaScript program, if we have an object, how can we **serialize it in JSON**?                                                                                      |
|          | To serialize an object to a JSON string, we can use `JSON.stringify()`, we then can deserialize it using `JSON.parse()`                                                  |
| Question | What is **npm**?                                                                                                                                                         |
|          | **npm** is a package manager for NodeJS (**N**odeJS **P**ackage **M**anager).                                                                                            |
| Question | What is the `npm install` command and what is the purpose of the `--save` flag?                                                                                          |
|          | This command is used to install a package (and its dependencies) in the current project. The `--save` flag tells npm to add the dependency to the project's package.json |
| Question | How can we use the `https://www.npmjs.com/` web site?                                                                                                                    |
|          | It can be used to search packages and their documentation. We can also find informations about the dependencies used and the existing versions.                          |
| Question | In JavaScript, how can we **generate a UUID** compliant with RFC4122?                                                                                                    |
|          | We can use the Node package `uuid` which is RFC4122 compliant with version 1, 3, 4 and 5 UUIDs.                                                                          |
| Question | In Node.js, how can we execute a function on a **periodic** basis?                                                                                                       |
|          | In Javascript (not only node js), we can use the `setInterval` function.                                                                                                 |
| Question | In Node.js, how can we **emit UDP datagrams**?                                                                                                                           |
|          | We can use the Node package `dgram` which is integrated to NodeJS.                                                                                                       |
| Question | In Node.js, how can we **access the command line arguments**?                                                                                                            |
|          | We can access the command line arguments, also called **argv**, with the array `process.argv`.                                                                           |

## Task 3: package the "musician" app in a Docker image

| #        | Topic                                                                                                                                                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Question | How do we **define and build our own Docker image**?                                                                                                                                                                                              |
|          | We define a docker image through a `Dockerfile` and we build it with the command line `docker build <path/to/Dockerfile> -t res/musician` with the path to the `Dockerfile`.                                                                      |
| Question | How can we use the `ENTRYPOINT` statement in our Dockerfile?                                                                                                                                                                                      |
|          | `ENTRYPOINT` is used when runinng an image (e.g. `docker run res/musician`). It will append all the argument after the command into the container. For instance, `docker run res/musician flute` will pass the argument `flute` on the container. |
| Question | After building our Docker image, how do we use it to **run containers**?                                                                                                                                                                          |
|          | We run a container with the command line `docker run <image>` with the image name (or in our case the tag we defined, either res/musician or res/auditor). |
| Question | How do we get the list of all **running containers**?                                                                                                                                                                                             |
|          | We list the running container with the command line `docker ps`.                                                                                                                                                                                  |
| Question | How do we **stop/kill** one running container?                                                                                                                                                                                                    |
|          | We stop a running container with the command line `docker stop <container>` and we kill it with `docker kill <container>`.                                                                                                                        |
| Question | How can we check that our running containers are effectively sending UDP datagrams?                                                                                                                                                               |
|          | We can check it using the Linux package `tcpdump`.                                                                                                                                                                                                |

## Task 4: implement an "auditor" Node.js application

| #        | Topic                                                                                                                                                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Question | With Node.js, how can we listen for UDP datagrams in a multicast group?                                                                                                                                                                                 |
|          | With the event `listening`from the package `dgram`.                                                                                                                                                                                                     |
| Question | How can we use the `Map` built-in object introduced in ECMAScript 6 to implement a **dictionary**?                                                                                                                                                      |
|          | A `Map` holds pair of keys and values. In our case, we can associate a string to a string which make it a dictionary.                                                                                                                                   |
| Question | How can we use the `Moment.js` npm module to help us with **date manipulations** and formatting?                                                                                                                                                        |
|          | We can use the methods `add()`, `substract()`, etc, in chain to manipulate the dates and `format()` format them with a given format passed on parameter.                                                                                                |
| Question | When and how do we **get rid of inactive players**?                                                                                                                                                                                                     |
|          | When an active player plays, the auditor schedule its deletion 5 seconds later. If the player make a sound in the meantime then the auditor reschedule its deletion 5 seconds later otherwise the auditor get rid of the player because he is inactive. |
| Question | How do I implement a **simple TCP server** in Node.js?                                                                                                                                                                                                  |
|          | We can implement a TCP server in node using the `net` build-in package.                                                                                                                                                                                 |

## Task 5: package the "auditor" app in a Docker image

| #        | Topic                                                                                |
| -------- | ------------------------------------------------------------------------------------ |
| Question | How do we validate that the whole system works, once we have built our Docker image? |
|          | We run the validation script `validate.sh`.                                          |

## Constraints

Please be careful to adhere to the specifications in this document, and in particular

-   the Docker image names
-   the names of instruments and their sounds
-   the TCP PORT number

Also, we have prepared two directories, where you should place your two `Dockerfile` with their dependent files.

Have a look at the `validate.sh` script located in the top-level directory. This script automates part of the validation process for your implementation (it will gradually be expanded with additional operations and assertions). As soon as you start creating your Docker images (i.e. creating your Dockerfiles), you should try to run it.
