mkdir /tmp/connect \
  && cd /tmp/connect \
  && curl -# -L http://github.com/extjs/Connect/tarball/master \
  | tar xz --strip 1 \
  && make install \
  && echo "Installation complete"