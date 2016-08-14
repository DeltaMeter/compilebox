############################################################
# Dockerfile to build sandbox for executing user code
# Based on Ubuntu
############################################################

FROM chug/ubuntu14.04x64 
MAINTAINER MICHAEL LUO

# Update the repository sources list
RUN echo "deb http://archive.ubuntu.com/ubuntu trusty main universe" > /etc/apt/sources.list
RUN apt-get update

#Install non-language related packages
RUN apt-get install -y bc
RUN apt-get install -y wget

#Install all the languages/compilers we are supporting.

RUN apt-get install -y python
RUN apt-get install -y python3

#prepare for Java download
RUN apt-get install -y python-software-properties
RUN apt-get install -y software-properties-common

#grab oracle java (auto accept licence)
RUN \
  echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | debconf-set-selections && \
  add-apt-repository -y ppa:webupd8team/java && \
  apt-get update && \
  apt-get install -y oracle-java8-installer && \
  rm -rf /var/lib/apt/lists/* && \
  rm -rf /var/cache/oracle-jdk8-installer

#grab JUnit
RUN wget http://search.maven.org/remotecontent?filepath=junit/junit/4.12/junit-4.12.jar -O /usr/share/java/junit.jar
RUN wget http://search.maven.org/remotecontent?filepath=org/hamcrest/hamcrest-core/1.3/hamcrest-core-1.3.jar -O /usr/share/java/hamcrest-core.jar
