mkdir /tmp/connect \
  && cd /tmp/connect \
  && curl -# -L http://github.com/senchalabs/connect/tarball/master \
  | tar xz --strip 1 \
  && make install \
  && echo "Installation complete"