##############################################################
# Setup node image
##############################################################

ARG ALPINE_VERSION=3.21.3
ARG NODE_VERSION=23.9.0

FROM node:${NODE_VERSION}-alpine AS node
FROM alpine:${ALPINE_VERSION}

COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

##############################################################
# Install quartz
##############################################################

ARG QUARTZ_VERSION=feat/1915-front-matter-url-override

WORKDIR /quartz

RUN addgroup -S quartz && \
    adduser -S quartz -G quartz

RUN apk add --no-cache --update coreutils git && \
    git clone https://github.com/anthops/quartz.git . && \
    git -c advice.detachedHead=false checkout "${QUARTZ_VERSION}" && \
    apk del git

COPY --chown=quartz:quartz entrypoint.sh .
RUN chmod +x ./entrypoint.sh

RUN npm ci

RUN chown -R quartz:quartz /quartz

COPY --chown=quartz:quartz customisations/ .

# strip emojis from folder names
COPY --chown=quartz:quartz ["content/📝 Projects", "content/Projects"]
COPY --chown=quartz:quartz ["content/🧠 Knowledge/☁️ Cloud", "content/Knowledge/Cloud"]
COPY --chown=quartz:quartz ["content/🧠 Knowledge/⛓️ Blockchain", "content/Knowledge/Blockchain"]
COPY --chown=quartz:quartz ["content/🧠 Knowledge/🌐 Networking", "content/Knowledge/Networking"]
COPY --chown=quartz:quartz ["content/🧠 Knowledge/📜 Software Licensing", "content/Knowledge/Software Licensing"]
COPY --chown=quartz:quartz ["content/🧠 Knowledge/📞 Telephony Systems", "content/Knowledge/Telephony Systems"]
COPY --chown=quartz:quartz ["content/🧠 Knowledge/🖥️ Operating Systems", "content/Knowledge/Operating Systems"]
COPY --chown=quartz:quartz ["content/🧠 Knowledge/🤖 Artificial Intelligence", "content/Knowledge/Artificial Intelligence"]
COPY --chown=quartz:quartz ["content/🧠 Knowledge/🧑🏼‍💻 Programming", "content/Knowledge/Programming"]
COPY --chown=quartz:quartz ["content/🧠 Knowledge/🚀 DevSecOps & Platforms", "content/Knowledge/DevSecOps & Platforms"]
COPY --chown=quartz:quartz ["content/🧠 Knowledge/🛡️ Cybersecurity", "content/Knowledge/Cybersecurity"]
COPY --chown=quartz:quartz ["content/_images", "content/_images"]
COPY --chown=quartz:quartz ["content/index.md", "content/index.md"]

USER quartz

CMD ["./entrypoint.sh"]
